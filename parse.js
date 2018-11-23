var fs = require('fs');
var _ = require('underscore');
var handValues = require('./handVals.js');
var username = 'nicholasj25', username2 = 'hzane', username3 = 'nitwit227';
var global_obj_counter = {};
var handChecker = require('./handChecker.js');
module.exports = start;

function start(dirname, callback){
var res = [];

  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
        var d = fs.readFileSync(dirname + filename, 'utf-8');
        var obj = parsePokerStarsTournament(d);
        res.push(obj);
    });
    callback(res);
  });
}
function parsePokerStarsTournament(tournament){
  global_obj_counter = {};
  var allRounds = tournament.split("\r\n\r\n\r\n\r\n");
  var result = {items:[]};
  result.items = getItems(allRounds);
  result.details = getDetails(allRounds);
  result.counter = sortObj(calcCount(global_obj_counter));
  result.luck = getLuck(result.items).toFixed(2);
  result.dealLuck = Math.round(getDealLuck(result.items));
  result.handRanks = getHandRanks(result.items);
  result.raises = getRaises(allRounds).raises;
  result.allins = getAllins(result.items);
  result.raised = getRaises(allRounds).raised;
  result.tourneySum = getSummary(allRounds);

  return result;
}
function getHandRanks(obj){
  var ranks = _.pluck(obj, 'handRank'), res=0;
  for(var i = 0, length1 = ranks.length; i < length1; i++){
    res = res + parseInt(ranks[i]);
  }
  return res;

}
function getSummary(allRounds){
  var res = [];
  var last = allRounds[allRounds.length-2];
  var tmpO = getAction(last).all;
  for(var i = 0; i < tmpO.length; i++){
    var line = tmpO[i];
    if((checkUser(line)) && (line.indexOf('finished') > -1 || line.indexOf('wins') > -1)){
      res.push(line);
    }
  }
  if(!res.length){
    var idx = tmpO.reverse().findIndex(function(line){
        return checkUser(line);
      });
    res.push(tmpO[idx]);
  }
  return res.join(", ");
}
function getDetails(allRounds){
  var first = allRounds[0];
  var result = first.split("\r\n")[0];
  return result;  
}
function getItems(allRounds){
  var res = [];
  for(var i=0;i<allRounds.length;i++){
    var round = allRounds[i];
    if(round.length){
      res.push(parse(round));
    }
  }
  return res;
}
function getRaises(obj){
  var raises = 0, raised = 0;
  obj.forEach( function(round, index) {
    var lines = round.split("\r\n");
    var stop = false;
    lines.forEach(function(line){
      if((line.indexOf('raises') > -1 || line.indexOf('bets') > -1) && (checkUser(line))){
        raises++;
      }
      if(!stop && (line.indexOf('raises') > -1 || line.indexOf('bets') > -1) && (checkUser(line))){
        raised++;
        stop=true;
      }
    });
  });
  return {raises:raises, raised:raised};
}
function getDealLuck(result){
  var res = 0;
  result.forEach(function(item){
    res = parseInt(res) + parseFloat(item.handValue);
  });
  return res;

}
function getLuck(result){
  var res = 0;
  result.forEach(function(item){
    res = parseFloat(res) + parseFloat(item.hcVal);
  });
  return res;
}
function sortObj(obj){
  var res = [];
  res[0] = {key:'fold-preflop', val:obj['fold-preflop']};
  res[1] = {key:'fold-postflop', val:obj['fold-postflop']};
  res[2] = {key:'fold-turn', val:obj['fold-turn']};
  res[3] = {key:'fold-river', val:obj['fold-river']};
  res[4] = {key:'lost-showdown', val:obj['lost-showdown']};
  res[5] = {key:'won-folds', val:obj['won-folds']};
  res[6] = {key:'won-showdown', val:obj['won-showdown']};

  return res;
}
function calcCount(obj){
  var total = _.reduce(obj, function(m, i){
    return m+i;
  });
  for(var i=0;i<Object.keys(obj).length;i++){
    let key = Object.keys(obj)[i];
    obj[key] = obj[key] + ' / ' + ((obj[key]/total) * 100).toFixed(1) + '%';  
  }
  return obj;
}
function parse(round){
  var result = [];
  var lines = round.split("\r\n");
  var x = lines.findIndex(function(line){
    return line.indexOf('Dealt to ') > -1;
  });
  var hc = typeof lines[x]==='string' ? lines[x].substring(lines[x].indexOf('[')+1, lines[x].indexOf(']')) : '';
  var holeCards = hc;
  var hcVal = calcHand(hc);
  var counter = lines.findIndex(function(line){
    return line.indexOf('*** SUMMARY ***') > -1;
  })+1;
  var stop = lines.length;
  while(counter < stop){
    result.push(lines[counter]);
    counter++;
  }
  var us = result.findIndex(function(line){
    return checkUser(line);
  });
  if(typeof result[1] === 'string' && result[1].indexOf('Board') === 0){ 
    var board =  result[1].substring(result[1].indexOf('[')+1, result[1].indexOf(']'));
  }else{
    var board = '';
  }
  var event = {res: 'unknown'};
    event.res = result[us].indexOf('collected') > -1 ? 'won-folds' : event.res;
    event.res = result[us].indexOf('won') > -1 ? 'won-showdown' : event.res;
    event.res = result[us].indexOf('lost') > -1 ? 'lost-showdown' : event.res;
    event.res = result[us].indexOf('mucked') > -1 ? 'lost-showdown' : event.res;
    event.res = result[us].indexOf("folded before Flop") > -1 ? 'fold-preflop' : event.res;
    event.res = result[us].indexOf("folded before the Draw") > -1 ? 'sitting-out' : event.res;
    event.res = result[us].indexOf('folded on the Flop') > -1 ? 'fold-postflop' : event.res;
    event.res = result[us].indexOf('folded on the Turn') > -1 ? 'fold-turn' : event.res;
    event.res = result[us].indexOf('folded on the River') > -1 ? 'fold-river' : event.res;
    global_obj_counter[event.res] = typeof global_obj_counter[event.res] === 'number' ? global_obj_counter[event.res]+1 : 1;
    if(result[us].indexOf('won') > -1 || result[us].indexOf('collected') > -1){
        global_obj_counter['won'] = typeof global_obj_counter['won'] === 'number' ? global_obj_counter['won']+1 : 1;
    }
  var pot_size = result[0].substring(9, result[0].indexOf('|'));
  var action = getAction(round);
  var winloss = getWinloss(action);
  var bb = getBB(round);
  var position = getPosition(round);
  var handCheckRes = checkHand(hc + " " + board);
  var handStatus = handCheckRes.name;
  var handValue = handCheckRes.val;
  var handRank = handCheckRes.rank;
  var stacksize = getStackSize(round);
  var numRaises = getNumRaises(action);
  return {handRank:handRank, handValue:handValue,numPlayers:getNumPlayers(round), numCalls:getNumCalls(action), numRaises:numRaises, stacksize:stacksize, handStatus:handStatus, ante:bb, winloss:winloss.total, pot_size:pot_size, board:board, user:result[us], hc:holeCards, hcVal:hcVal, action:action, event:event, position:position};
}
function getNumPlayers(round){
  var res = 0;
  var summary = getStartSummary(round);
  for(var i = 0, length1 = summary.length; i < length1; i++){
    var line = summary[i];
    if(line.indexOf('Seat') > -1){
        res++;
    }
  }
  return res;

}
function getNumRaises(action){
  var res = 0;
  for(var i = 0, length1 = action.user.length; i < length1; i++){
    var line = action.user[i];
    if(line.indexOf('bets') > -1 || line.indexOf('raises') > -1){
        res++;
    }
  }
  return res;
}
function getNumCalls(action){
  var res = 0;
  for(var i = 0, length1 = action.user.length; i < length1; i++){
    var line = action.user[i];
    if(line.indexOf('calls') > -1){
        res++;
    }
  }
  return res;
}
function getStackSize(obj){
    var summary = getStartSummary(obj), res=null;
    var id = summary.findIndex(function(line){
      return checkUser(line);
    });
    return summary[id].substring(summary[id].indexOf('(')+1, summary[id].indexOf(')')).split(" ")[0];
}
function checkHand(cards){
  var cards = cards.split(" ");
  var res = handChecker(cards);
  return res;
}
function getBB(obj){
    var summary = getStartSummary(obj), res=null;
    var i = summary.findIndex(function(e){
      return e.indexOf('big blind') > -1;
    });
    if(typeof summary[i] === 'undefined'){
      res = '?';
    }else{
      res = summary[i].substring(summary[i].lastIndexOf(' '), summary[i].length);
    }
    return res;
}
function getWinloss(obj){
    var val = 0, res = {}, running = 0, tmpOb = [];
    obj.user.forEach( function(line, index) {
      tmpOb = line.split(" ");
      tmpOb.reverse();
      val = tmpOb.findIndex(function(e, i){
        return !isNaN(e) && tmpOb[i+1] !== 'to';
      });
      running = parseInt(running)+parseInt(tmpOb[val]);
    });
    res.total = running;
    return res;

}
function getAllins(obj){
  var res = 0;
  obj.forEach( function(item, index){
    item.action.all.forEach( function(line, i) {
      if(line.indexOf('all-in') > -1 && (checkUser(line))){
        res++;
      }
    });
  });
  return res;
}
function checkUser(str){
  return str.indexOf(username) > -1 || str.indexOf(username2) > -1 || str.indexOf(username3) > -1;

}
function getPosition(round){
  var res = null;
  var summary = getStartSummary(round);
  var bb = summary[summary.length-1].split(":")[0];
  var sb = summary[summary.length-2].split(":")[0];
  var r = getFirstRound(round);
  if(checkUser(bb)){
    return "big blind";
  }
  if(checkUser(sb)){
    return "small blind";
  }
  if(checkUser(r[r.length-3])){
    return "button";
  }
  if(checkUser(r[0])){
    return "UTG";
  }
  var position = r.findIndex(function(e){
    return checkUser(e);
  });
  return "UTG+" + position;
}
function clearDuplicates(obj){
  var list=[], res = [];
  for(var i=0;i<obj.length;i++){
    var name = obj[i].substring(0, obj[i].indexOf(':'));
    if(list.indexOf(name) === -1){
      list.push(name);
      res.push(obj[i]);
    }
  }
  return res;
}
function calcHand(obj){
  var suitVals = {'T':10, 'J':11, 'Q':12, 'K':13, 'A':14};
  var card1 = obj.split(" ")[0][0];
  var card2 = obj.split(" ")[1][0];
  var card1s = obj.split(" ")[0][1];
  var card2s = obj.split(" ")[1][1];
  var card1V = typeof suitVals[card1] === 'number' ? suitVals[card1] : card1;
  var card2V = typeof suitVals[card2] === 'number' ? suitVals[card2] : card2;
  var h = card1 + card2;
  if(card2V > card1V){
    h = card2 + card1;
  }
  if(card1s === card2s){
    h = h + 's';
  }
  return handValues[h];

}
function convHand(obj){
  var suitVals = {'T':10, 'J':11, 'Q':12, 'K':13, 'A':14};
  var card1 = obj.split(" ")[0][0];
  var card2 = obj.split(" ")[1][0];
  var card1s = obj.split(" ")[0][1];
  var card2s = obj.split(" ")[1][1];
  var card1V = typeof suitVals[card1] === 'number' ? suitVals[card1] : card1;
  var card2V = typeof suitVals[card2] === 'number' ? suitVals[card2] : card2;
  var h = card1 + card2;
  if(card2V > card1V){
    h = card2 + card1;
  }
  if(card1s === card2s){
    h = h + 's';
  }
  return h;

}
function getStartSummary(round){
      var lines = round.split("\r\n");
      var end = lines.findIndex(function(line){
        return line.indexOf('*** HOLE CARDS ***') > -1;
      });
      return lines.slice(0, end);
}
function getFirstRound(round){
      var lines = round.split("\r\n");
      var start = lines.findIndex(function(line){
        return line.indexOf('*** HOLE CARDS ***') > -1;
      })+2;
      var end = lines.findIndex(function(line, i){
        return line.indexOf('*** FLOP ***') > -1 || line.indexOf('*** SUMMARY ***') > -1;
      });
      return lines.slice(start, end);
}
function getAction(round){
        result = {all:[], user:[]};
        var lines = round.split("\r\n");
        var start = lines.findIndex(function(line){
          return line.indexOf('*** HOLE CARDS ***') > -1;
        });
        var end = lines.findIndex(function(line){
          return line.indexOf('*** SUMMARY ***') > -1;
        });
        counter = start+1;
       while(counter < end && start < end && typeof start === 'number' && typeof end === 'number'){
        result.all.push(lines[counter]);
        counter++;
       }

      var us = [];
      for(var i=0;i<result.all.length;i++){
        if(checkUser(result.all[i]) && (result.all[i].indexOf('calls') > -1 || result.all[i].indexOf('raises') > -1 || result.all[i].indexOf('bets') > -1)){
          
          result.user.push(result.all[i].replace(username+':', '').replace(username2+':', '').replace(username3+':', ''));
        }
      }
       return result;

}


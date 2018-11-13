
var _ = require('underscore');

function evalHand(cards){
	var faceVals = {'T':10,'J':11,'Q':12,'K':13,'A':14};
	var suits = {d:'diamond',h:'heart',c:'club',s:'spade'};
	var val = null, id=null,suit=null,cardsObj=[], result=[], count=0;;
	cards.forEach( function(c, index){
		val = c[0];
		val = typeof faceVals[val] === 'number' ? faceVals[val] : parseInt(val);
		suit = suits[c[1]];
		obj = {val:val, card:c[0], suit:suit, id:c[0]+suit};
		cardsObj.push(obj);
	});
	for (var i = 0; i < handChecks.length; i++){
		var res = handChecks[i].fn(cardsObj);
		if(res.has){
			result = handChecks[i].name;
		}
	}
	return result;
}

var handChecks = [{name:'High Card'/*0*/, val:1, fn:function(cards){
												cards = scoreHand(cards), res=[], res.push(cards[0]);
												return {has:true, res:res};
											}}, 
				 {name:'One Pair'/*1*/, val:2, fn:function(cards){
				 								var res = {has:false, res:null};
				 								var match = matchCheck(cards, 'card');
				 								if(match.matches === 1){
				 									res = {has:true, res:match.tmp};
				 								}
				 								return res;
				 						}
				 },
				 {name:'Two Pair'/*2*/, val:3, tmp:[], fn:function(cards){
				 								var res = {has:false, res:null}, matches=0, tmp=[], tmpO={};
				 								var match = matchCheck(cards, 'card');
				 								if(match.matches===2){
				 								var obj = _.flatten(match.tmp);
				 								var cardsN = _.pluck(obj, 'card');
				 								for(var i = 0, length1 = cardsN.length; i < length1; i++){
				 									tmpO[cardsN[i]] = typeof tmpO[cardsN[i]] === 'number' ? tmpO[cardsN[i]]+1 : 1;
				 								}
				 								var vals = Object.values(tmpO);
				 								if(vals[0]===2 && vals[1]===2){
				 									res = {has:true, res:match.tmp};
				 								}
				 								}
				 								return res;
				 							}}, 
				 {name:'Three of a Kind'/*3*/, val:4, fn:function(cards){
				 								var res = {has:false, res:null}, tmpO={};
				 								var match = matchCheck(cards, 'card');
				 								if(match.matches === 3){
				 									res = {has:true, res:match.tmp};
				 								}
				 								return res;

				 }}, 
				 {name:'Four of a Kind'/*7*/, val:8, fn:function(cards){
				 								var res = {has:false, res:null};
				 								var match = matchCheck(cards, 'card');
				 								if(match.matches === 4){
				 									res = {has:true, res:match.tmp};
				 								}
				 								return res;
				 }},
				 {name:'Straight'/*4*/, val:5, fn:function(cards){
						var res = {has:false, res:3},prev=null,hits=0,tmp=[],counter=0,nextCard=null;
						cards.sort(function(a,b){
							return a.val > b.val;
						});
						var vals = _.uniq(_.pluck(cards, 'val'));
						for(var i = 0, length1 = vals.length; i < length1; i++){
							var current = vals[i];
							var next =vals[i+1];
								if(current+1===next){
									hits++;
									tmp.push(cards[counter].card);
									if(hits > 3){
										nextCard = _.find(cards, function(obj){
											return obj.val === next;
										});
										tmp.push(nextCard.card);
										res = {has:true, res:tmp.join('')};
									}
								}else{
									hits=0;
									tmp=[];
								}
							counter++;
						}
						return res;

				 }}, 
				 {name:'Flush'/*5*/, val:6, fn:function(cards){
				 								var res = {has:false, res:null};
				 								var match = matchCheck(cards, 'suit');
				 								if(match.matches > 4){
				 									res = {has:true, res:match.tmp};
				 								}
				 								return res;

				 }},
				 {name:'Full House'/*6*/, val:7, fn:function(cards){
							var res = {has:false, res:null};

							var c = null, tmp=[], match=null;
							var obj = {};
							var matches = matchCheck(cards, 'card');
			 				if(matches.matches === 4){
			 					for(var i = 0, length1 = matches.tmp.length; i < length1; i++){
			 						var item = matches.tmp[i];
			 						item.forEach( function(match, index) {
			 							obj[match.card] = (typeof obj[match.card] === 'number') ? obj[match.card] + 1 : 1;
			 						});
			 					}
			 					var vals = Object.values(obj);
			 					if(vals[0]===6 && vals[1]===2){
									var res = {has:true, res:matches.tmp};
			 					}
			 				}

				 			return res;

				 }},
				 {name:'Straight Flush'/*8*/, val:9, fn:function(cards){
				 	var res = {has:false, res:null};
				 	var sc = handChecks[4].fn(cards),
				 		fc = handChecks[5].fn(cards);
				 	if(sc.has && fc.has){
				 		res = {has:true, res:sc.res};
				 	}
				 	return res;

				 }},
				 {name:'Royal Flush'/*9*/, val:10, fn:function(cards){
				 	var res = {has:false, res:null};
				 	var sc = handChecks[4].fn(cards),
				 		fc = handChecks[5].fn(cards);
				 	if(sc.has && fc.has && royalCheck(sc.res)){
				 		res = {has:true, res:sc.res};
				 	}
				 	return res;
				 }}];


function matchCheck(cards, type){
		var matches=0, tmp=[],tmpO=[];
		for(var i=0;i<cards.length;i++){
			var res = compare(cards[i], cards.slice(i+1, cards.length), type);
			if(res.length){
				tmpO.push(res);
			}
		}
		return {matches:tmpO.length, tmp:tmpO};
}
function compare(needle, obj, type){
	var res=[];
	obj.forEach(function(e, index){
		if(e[type] === needle[type] && e.id !== needle.id && res.indexOf([e, needle]) === -1){
			res.push([e, needle]);
		}
	});
	return res;
}
function royalCheck(cards){
	var def = 'TJQKA';
	return def === cards;
}
function scoreHand(cards){
	var faceVals = {'T':10,'J':11,'Q':12,'K':13,'A':14};
	var res = [], r=null;
	cards.forEach(function(e, i) {
		r = isNaN(e.card) ? faceVals[e.card] : parseInt(e.card);
			res.push({card:e.card, suit:e.suit, val:r});	
	});
	res.sort(function(a,b){
		return a.val < b.val;
	});
	return res;
}
function reduce(numerator,denominator){
  var gcd = function gcd(a,b){
    return b ? gcd(b, a%b) : a;
  };
  gcd = gcd(numerator,denominator);
  return [numerator/gcd, denominator/gcd];
}
function extract(obj, name){
	var res = [];
	obj.forEach(function(e,i){
		res.push(e[name]);
	});
	return res;
}
var probabilityCalcs = {
	/*C(n,r) = n! / r!(n-r)!*/
	'one-pair':function(cards){
		/*(13C1)(4C2)x(12C3)(4)(4)(4)*/
		var res={};
		res.outs = cards.length * 3;
		var lcd = reduce(res.outs, 52-cards.length);
		res.probability = Math.round(lcd[0]/lcd[1]*100, 2);
		return res;
	},
	'two-pair':function(cards){
		/*(13C2)(4c2)(4c2)x(11C1)(4c1)*/
		var res={outs:'',probability:''};
		return res;
	}
};
module.exports = evalHand;

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
	var matches = matchCheck(cardsObj, 'card');
	for (var i = 0; i < handChecks.length; i++){
		var res = handChecks[i].fn(matches, cardsObj);
		if(res.has){
			result = handChecks[i].name;
		}
	}
	var res = {
		name:result,
		val:handOdds[result],
		rank:handRankings[result]
	};
	return res;
}
function matchCheck(cards, type){
		var num=1, tmp=[],tmpO={}, tmp=[];
		for(var i=0;i<cards.length;i++){
			res = compare(cards[i], cards.slice(i+1, cards.length), type);
			num = res.num ? num+res.num : num;
			if(res.tmp.length){
				tmp.push(res.tmp);
			}
		}
		tmp = _.uniq(_.flatten(tmp));
		return {num:num, tmp:tmp};
}
function compare(needle, obj, type){
	var tmp=[],res=null;
	var hits=0, pair=null;
	obj.forEach(function(e, index){
		if(e[type] === needle[type] && e.id !== needle.id && tmp.indexOf(pair) === -1){
			pair = [e, needle];
			tmp.push(pair);
			hits++;
		}
	});
	res = {num:hits, tmp:tmp};
	return res;
}
var handChecks = [{name:'High Card'/*0*/, val:1, fn:function(matches, cardsObj){
												cards = scoreHand(cardsObj), res=[], res.push(cardsObj[0]);
												return {has:true, res:res};
											}}, 
				 {name:'One Pair'/*1*/, val:2, fn:function(matches, cardsObj){
				 								var res = {has:false, res:null};
				 								if(matches.num === 1){
				 									res = {has:true, res:matches.tmp};
				 								}
				 								return res;
				 						}
				 },
				 {name:'Two Pair'/*2*/, val:3, tmp:[], fn:function(matches, cardsObj){
				 								var res = {has:false, res:null}, tmp=[];
				 								if(matches.num===2){
				 									res = {has:true, res:matches.tmp};
				 								}
				 								return res;
				 							}}, 
				 {name:'Three of a Kind'/*3*/, val:4, fn:function(matches, cardsObj){
				 								var res = {has:false, res:null}, tmpO={};
				 								if(matches.num === 3){
				 									res = {has:true, res:matches.tmp};
				 								}
				 								return res;

				 }}, 
				 {name:'Four of a Kind'/*4*/, val:8, fn:function(matches, cardsObj){
				 								var res = {has:false, res:null};
				 								if(matches.num > 4){
				 									res = {has:true, res:matches.tmp};
				 								}
				 								return res;
				 }},
				 {name:'Straight'/*5*/, val:5, fn:function(matches, cardsObj){
						var res = {has:false, res:3},prev=null,hits=0,tmp=[],counter=0,nextCard=null;
						cardsObj.sort(function(a,b){
							return a.val > b.val;
						});
						var vals = _.uniq(_.pluck(cardsObj, 'val'));
						for(var i = 0, length1 = vals.length; i < length1; i++){
							var current = vals[i];
							var next =vals[i+1];
								if(current+1===next){
									hits++;
									tmp.push(cardsObj[counter].card);
									if(hits > 3){
										nextCard = _.find(cardsObj, function(obj){
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
				 {name:'Flush'/*6*/, val:6, fn:function(matches, cardsObj){
				 								var matches = matchCheck(cardsObj, 'suit'),tmpO={}, tmp=[];
				 								var res = {has:false, res:null};
				 								if(matches.num > 4){
				 									matches.tmp.forEach(function(item){
				 										tmpO[item.suit] = typeof tmpO[item.suit]==='number' ? tmpO[item.suit]+1 : 1;
				 									});
				 									var maxVal = _.max(tmpO, function(a,b){
				 										return a>b;
				 									});
				 									if(maxVal > 4){
				 										res = {has:true, res:matches.tmp};
				 									}
				 									
				 								}
				 								return res;

				 }},
				 {name:'Full House'/*7*/, val:7, fn:function(matches, cardsObj){
							var res = {has:false, res:null};
							var c = null, tmp=[], match=null;
							var obj = {};
							console.log(matches);
			 				if(matches.num === 4){
			 					for(var i = 0, length1 = matches.tmp.length; i < length1; i++){
			 						var match = matches.tmp[i];
			 						obj[match.card] = (typeof obj[match.card] === 'number') ? obj[match.card] + 1 : 1;
			 					}
			 					var vals = Object.values(obj);
			 					vals.sort();
			 					if(vals[0]===2 && vals[1]===3){
									var res = {has:true, res:matches.tmp};
			 					}
			 				}

				 			return res;

				 }},
				 {name:'Straight Flush'/*8*/, val:8, fn:function(matches, cardsObj){
				 	var res = {has:false, res:null};
				 	var sc = handChecks[4].fn(matches, cardsObj),
				 		fc = handChecks[5].fn(matches, cardsObj);
				 	if(sc.has && fc.has){
				 		res = {has:true, res:sc.res};
				 	}
				 	return res;

				 }},
				 {name:'Royal Flush'/*9*/, val:9, fn:function(matches, cardsObj){
				 	var res = {has:false, res:null};
				 	var sc = handChecks[4].fn(matches, cardsObj),
				 		fc = handChecks[5].fn(matches, cardsObj);
				 	if(sc.has && fc.has && royalCheck(sc.res)){
				 		res = {has:true, res:sc.res};
				 	}
				 	return res;
				 }}];


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
var handRankings = {
	'High Card':0,
	'One Pair':1,
	'Two Pair':2,
	'Three of a Kind':3,
	'Straight':4,
	'Flush':5,
	'Full House':6,
	'Four of a Kind':7,
	'Straight Flush':8,
	'Royal Flush':9
};
var handOdds = {
	'High Card':1,
	'One Pair':1.4,
	'Two Pair':20,
	'Three of a Kind':46.3,
	'Straight':254,
	'Flush':508,
	'Full House':693,
	'Four of a Kind':4165,
	'Straight Flush':72192,
	'Royal Flush':649940
};
module.exports = evalHand;
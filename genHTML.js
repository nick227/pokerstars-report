module.exports = genHTML;
var _ = require('underscore');

function genHTML(data){
var luckAll = _.pluck(data, 'luck');
var luckAvg = _.reduce(luckAll, function(m,i){
	return parseFloat(m)+parseFloat(i.split(" ")[0]);
});
var raisedAll = _.pluck(data, 'raised');
var raisedAvg = _.reduce(raisedAll, function(m,i){
	return parseFloat(m)+parseFloat(i);
});
luckAvg = luckAvg/data.length;
raisedAvg = raisedAvg/data.length;


	var html = `<html><body><style>
					body{width:100%;height:100%;font-size:18px;font-family:tahoma}
					h1,h2,h3,h4,h5{margin:0}
					.hidden{display:none !important;}
					.toggleNext{color:blue;text-decoration:underline;cursor:pointer;width: 100%;background: yellow;}
					.fold-preflop{background:#888;color:#fff;}
					.fold-postflop{background:#FF005D;color:#fff;}
					.fold-turn{background:#a30015;color:#fff;}
					.fold-river{background:#59000b;color:#fff;}
					.won-folds{background:blue;color:#fff;}
					.won-showdown{background:green;color:#fff;}
					.lost-showdown{background:#000;color:#fff;}
					.sitting-out{background:#acg;color:#fff;}
					.row{display:flex;}.row > div{min-width:150px;}
					.row a{padding:0 8px;text-decoration:underline;}
					.nav{cursor:pointer;}
					.nav:hover{background:gray;}
					.grid{display:flex;flex-wrap:wrap;  transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);}
					.fullwidth{width:100% !important; flex: 1 1 100% !important;}
					.item{border:6px solid white;margin:1px;padding:6px;overflow-y:auto;width:240px;}
					ul{list-style-type:none;padding:0;display:flex; flex-wrap: wrap;}
					li{flex: 1 1 20%;padding:11px;min-width:480px;}
					.sortBy{display:none;}
					hr{clear:both; width:100%;height:6px;background:black;}
					hr.small{height:1px;background:gray;}
					#poker-res{padding:0 7%}
					</style>
					<script src="//cdnjs.cloudflare.com/ajax/libs/list.js/1.5.0/list.min.js"></script>
					<script>
					document.addEventListener("DOMContentLoaded", function() {
						var options = {
    							valueNames: [ 'status', 'numHands', 'luck', 'raised','all-ins', 'tourny-date', 'aggression', 'type', 'fold-preflop-s', 'fold-turn-s', 'fold-river-s', 'lost-showdown-s', 'won-s', 'won-folds-s', 'won-showdown-s' ]
							};
						var list = new List('poker-res', options);
					  	document.querySelector('.sortBy').style.display = 'flex';
					  	var toggleBtns = document.querySelectorAll('.toggleNext');
					  	for(var i = 0, length1 = toggleBtns.length; i < length1; i++){
					  		var btn = toggleBtns[i];
					  		btn.onclick = function(e){
					  			var elm = this.nextSibling;
					  			if(elm.classList.contains('hidden')){
					  				elm.classList.remove('hidden');
					  				elm.parentNode.classList.add('fullwidth');
					  				elm.scrollIntoView();
					  			}else{
					  				elm.classList.add('hidden');
					  				elm.parentNode.classList.remove('fullwidth');
					  			}
					  		}
					  	}
					});
					</script><div id="poker-res">`;		

	html += 'tournaments: ' + data.length;
	html += '<BR>luck avg: ' + luckAvg;
	html += '<BR>raised avg: ' + raisedAvg;
	html += `<div class="row sortBy">sort by: <a class="sort nav" data-sort="status"> status</a> 
						<a class="sort nav" data-sort="tourny-date"> date</a> 
						<a class="sort nav" data-sort="type"> type</a> 
						<a class="sort nav" data-sort="luck"> luck</a> 
						<a class="sort nav" data-sort="all-ins"> all-ins</a> 
						<a class="sort nav" data-sort="raised"> raised</a> 
						<a class="sort nav" data-sort="aggression"> aggression</a> 
						<a class="sort nav" data-sort="numHands"> num hands</a> 
						<a class="sort nav" data-sort="lost-showdown-s"> showdown lost</a> 
						<a class="sort nav" data-sort="fold-preflop-s"> preflop fold</a> 
						<a class="sort nav" data-sort="fold-turn-s"> turn fold</a> 
						<a class="sort nav" data-sort="fold-river-s"> river fold</a> 
						<a class="sort nav" data-sort="won-s"> won</a> 
						<a class="sort nav" data-sort="won-folds-s"> folds win</a> 
						<a class="sort nav" data-sort="won-showdown-s"> showdown win</a>
						</div>
						<HR>
					<ul class="list">`;
	data.forEach(function(item){
		html += '<li><div style="min-height:120px;"><h4 class="type" style="">'+item.details+'</h4>';
		html += '<div class="tourny-date" style="display:none;">'+item.details.substring(item.details.lastIndexOf('-')+2)+'</div>';
		html += '<div class="status">'+item.tourneySum+'</div></div>';
		html += '<hr class="small">';
		html += '<div style="">luck: <span class="luck">'+item.luck+'</span></div>';
		html += '<div class="aggression">aggression: '+(item.raises/item.items.length).toFixed(4)+'</div>';
		html += '<div class="all-ins">all ins: '+item.allins+'</div>';
		html += '<hr class="small">';
		html += '<div style="">total raises: '+item.raises+ ' / ' + ((item.raises/(item.items.length*4))*100).toFixed(0) + '%</div>';
		html += '<div style="">hands raised: <span class="raised">'+item.raised+ ' / ' + ((item.raised/item.items.length)*100).toFixed(0) + '%</span></div>';
		html += '<div class="numHands" style="">num hands: '+item.items.length+'</div>';
		html += '<hr class="small">';
		html += '<div style="">';
		for(var k=0;k<item.counter.length;k++){
			html += '<div class="row"><div>' + item.counter[k].key+': </div><div class="'+item.counter[k].key+'-s">'+ (item.counter[k].val==undefined ? 0 : item.counter[k].val) +'</div></div>';
		}
		html += '</div>';
		html += '<hr class="small">';
		html += '<div style="height:100px;overflow-y:auto;"><div class="row played" style="">played: ';
		var tmp = [];
				item.items.forEach(function(line){
					if(line.event.res !== 'fold-preflop'){
						if(tmp.indexOf(line.hc) === -1){
						tmp.push(line.hc);
						}
					}
				});
				html += tmp.join(', ');
		html += '</div>';
		html += '<div class="row folded" style="">folded: ';
		var tmp = [];
				item.items.forEach(function(line){
					if(line.event.res === 'fold-preflop'){
						if(tmp.indexOf(line.hc) === -1){
							tmp.push(line.hc);
						}
					}
				});
				html += tmp.join(', ');
		html += '</div></div>';
		html += '<hr class="small">';
		html += wrapItem(item.items);
		html += '<hr></li>';
	});
	html += '</ul></div></body></html>';
	return html;
}

function wrapItem(data){
	var html = '<a class="toggleNext">toggle history</a><div class="hidden grid">';
	data.forEach(function(line){
		html += '<div title="'+line.action.all+'" class="'+ line.event.res +' item" style="'+ (line.action.user.toString().indexOf("all-in") > -1 ? 'border-color:red' : (line.action.user.toString().indexOf("raises") > -1 || line.action.user.toString().indexOf("bets") > -1 ? 'border-color:#43ff38' : '')) +'">';
			var operat = line.event.res === 'won-folds' || line.event.res === 'won-showdown' ? '+' : '-';
			html += '<div>';
				html += line.hc;
			html += '</div>';
			html += '<div>';
				html += line.board.length ? line.board : 'n/a';
			html += '</div>';
			html += '<div>';
				html += line.handStatus;
			html += '</div>';
			html += '<hr class="small">';
			html += '<div>';
				html += 'pot: $'+line.pot_size;
			html += '</div>';
			html += '<div>';
			html += (operat === '+' ? 'won:' : 'lost: ') + operat + '$' + line.winloss;
			html += '</div>';
			html += '<div>';
			html += 'BB' + line.ante;
			html += '</div>';
			html += '<hr class="small"><div class="">';
			html += '<div>[';
				html += line.position;
			html += ']</div>';
			html += '<div>';
				html += 'stack size: ' + line.stacksize;
			html += '</div>';
			html += '<div>';
				html += 'ev: ' + line.hcVal;
			html += '</div>';
			html += '<div>';
				html += line.event.res;
			html += '</div>';
			html += '<hr class="small">';
			html += '<div>';
			html += line.action.user.toString().replace(/raises/g, '<u>raises</u>').replace(/bets/g, '<u>bets</u>').replace(/all-in/g, '<u style="">ALL-IN</u>');
			html += '</div></div>';
		html += '<div style="">';
		//html += line.action;
		html += '</div>';
		html += '</div>';

	});
	html += '</div>';
return html;
}
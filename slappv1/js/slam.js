/*
    SLAPP
    =====    
    A software for Poetry Slams
    
    Version 1
    
    by Markus Freise

	This Source Code Form is subject to the terms 
	of the Mozilla Public License, v. 2.0. If a copy 
	of the MPL was not distributed with this file, 
	You can obtain one at http://mozilla.org/MPL/2.0/.
    
    E-Mail: markus@freise.de

*/

/************************************************************************************************/
/*
/*  Global Variables
*/

_slam_bout_screens_default = ["logo","rooster_name","rooster","rooster_score"];
_slam_bout_screens_final   = ["logo","rooster_name","rooster"];

_slam_bout_screens = _slam_bout_screens_default;

_slam_bout_screen = "bout";
_slam_bout_screen_idx = 0;

_slam_poets = [];

_slam_vote_poet = 0;
_slam_vote_vote = 0;

_slam_event = "test";

_slam_key_firstdigit = true;

_rooster = { _poets_inc: 0 };

_slam = 0;

function compare(a,b){
	return a-b;
}

/************************************************************************************************/
/*
/*  Class
*/

function _poet(_poet_name,index,event,teilnehmer) {
	
	this.sort_score = "0000_0000_0000_0000";
	this.name  = _poet_name;
	this.complete = false;
	this.slam  = "";
	this.votes = [];
	this.ranking = 999;
	for(i=0;i<_slam_votes;i++) {
		this.votes[i] = 0;
		this.sort_score += "_0000";
	}
	this.score = 0;
	this.index = _rooster._poets_inc++;
	this.sort_score += "#"+pad(index,3);
	this.event = event;
	this.teilnehmer = teilnehmer;

}

/************************************************************************************************/
/*
/* Resets
*/

function resetscores() {
	for(i=0;i<_slam_poets.length;i++) {
		for(j=0;j<_slam_poets[i].votes.length;j++) {
			_slam_poets[i].votes[j] = 0;
		}		
	}
	_slam_rooster_calc();
	_slam_rooster_update();
	_slam_rooster_save();
}

function resetall() {
	_slam_poets = [];
	_slam_bout_screen_idx = 0;
	_slam_rooster_update();
	_slam_rooster_save();
}


/************************************************************************************************/
/*
/* Get Events
*/

function _get_slam() {

	if(_root!="") {
		$.getJSON(_root+"/wp-content/themes/lineofscrimmage/lib/get_rooster.php?pass="+_pass).done(
		function(data) {
			_slam = data;
			jQuery.each(data,function(idx,o) {
				$("#rundenplan").append('<p class="event"><a href="javascript:_get_slam_round('+idx+')" class="button">'+o.title+'</a></p>');
			})
		}
		).fail(function(j,t,e){$("#rundenplan").append('<p>Konnte Liste nicht laden.</p>Bitte prüfen, ob der Rechner mit dem Internet verbunden ist.</p>');});
	};
}

function _get_slam_round(idx) {

	_slam_poets = [];
	jQuery.each(_slam[idx].people,function(idx,o) {
		_slam_poets.push(new _poet(o.starter,_slam_poets.length,o.event,o.teilnehmer));
		_slam_rooster_save()
		_slam_rooster_update();
	});
	$("#rundenplan").html("<p>Geladen</p>");
	_slam_rooster_save()
	_slam_rooster_calc();
	_slam_rooster_update();


	$("#rundenplan").html("<p>Aktuell nicht implementiert.</p>");
	
}

function _get_slam_stechen() {
	if(_root!="" && _final) { // Ein Slam2013-Relikt. Bitte so lassen.
		_get_slam();
		_get_slam_round(_final);
	}
	_slam_bout_screens = ["logo","rooster_name","rooster"];
	_slam_bout_screen = "black";
	_slam_bout_screen_idx = 0;
	_slam_vote_poet = 0;
	_slam_vote_vote = 0;
	_slam_key_firstdigit = true;
	_slam_finalisten = 1;
}

function configchange() {
	
	_slam_finalisten = $("#finalisten").val();
	_slam_bout_screens = ["logo","rooster_name","rooster","rooster_score"];
	if($("#finalmode").attr("checked")) {
		_slam_bout_screens = ["logo","rooster_name","rooster"];
	}
	_show_bumper = $("#showbumper").attr("checked");

}

/************************************************************************************************/
/*
/*  Saves the current rooster
*/

function _slam_rooster_save() {

	rooster = JSON.stringify(_rooster)+"###"; // for localStorage
	ajax = ""; // for storage on server
	
	for(i=0;i<_slam_poets.length;i++) {
		rooster += JSON.stringify(_slam_poets[i])+"###";
		ajax += JSON.stringify(_slam_poets[i])+"###";
	}
	
	localStorage.setItem("_slam_"+_slam_event,rooster);
	
	if(_root!="") {
		$.ajax(_root+"/wp-content/themes/lineofscrimmage/lib/put_rooster.php",{type: "GET", data: {pass: _pass, event: _slam_poets[0].event, rooster: ajax}});
	}
	
	_slam_key_firstdigit = true;

}

/************************************************************************************************/
/*
/* Builds the markup for the different views
*/

function _slam_rooster_update() {

	$("ul li.poet").remove();

	if(_slam_poets.length) {
		
		html_ranking = [];
		html_bout = "";
	
		for(i=0;i<_slam_poets.length;i++) {
	
			_class_finalist = (_slam_poets[i].ranking<_slam_finalisten)?" finalist":"";
	
			/* First build HTML for the poet's votes */
	
			votes = "";
			streich_low = _slam_poets[i].streich_low;
			streich_high = _slam_poets[i].streich_high;
	
			incomplete = "";
			complete = " complete";
	
			for(j=0;j<_slam_poets[i].votes.length;j++) {
	
				complete = " complete";
				vote = _slam_poets[i].votes[j];
				addclass = "";
	
				if(vote==0) {
					votes += '<span class="vote'+addclass+' empty idx'+j+'">&nbsp;</span>';
					incomplete = " incomplete";
					finalist = "";
					complete = "";
				}else{
					if(vote==streich_low) { addclass=" strike"; streich_low = -1; }
					if(vote==streich_high && addclass=="") { addclass=" strike"; streich_high = -1; }
					if(vote<10) {
						votes += '<span class="vote'+addclass+' idx'+j+'">'+vote.toFixed(1)+"</span>";
					}else{
						votes += '<span class="vote'+addclass+' idx'+j+'">10</span>';
					}
				}
	
				if(j==_slam_vote_vote) {
					addclass += " active ";
				}
	
			}
	
			if(!_slam_poets[i].complete) {
				if(incomplete=="" && _slam_key_firstdigit) {
					$("body").removeClass("edit");
					_slam_poets[i].complete = true;	
				}
			}
	
			/* Than the rest of the markup for the poet */
	
			html = "";
			html += '<li class="poet'+_class_finalist+incomplete+complete+'" data-idx="'+i+'" ranking="'+_slam_poets[i].ranking+'" id="poet'+i+'">';
			html += '<h1>'+_slam_poets[i].name+'</h1>'; // Name of poet
			html += '<div class="votes" style="left: '+(82*(7-_slam_votes))+'px">'+votes+'</div>'; // Votes of poet
			html += '<div class="score">'+((_slam_poets[i].score==0)?"-":(1*_slam_poets[i].score).toFixed(1))+'</div>'; // Total score of poet
			html += '<span class="edit"><a href="#" onclick="_slam_removepoet('+i+');" class="i">-</a></span>';
			html += '<span class="edit"><a href="#" onclick="_slam_editpoet('+i+');" class="i">e</a></span>';
			html += "</li>";
			
			html_bout += html; // List in order of appearance
	
			html_ranking[_slam_poets[i].ranking] = html; // List in order of ranking
	
		}
		
		html_ranking_html = html_ranking.join("");
	
		// Let's put this list on different „screens“ with same data and use CSS to style, show and hide data.
	
		$("ul#bout").prepend(html_bout); // List in order appearance
		$("ul#rooster").prepend(html_bout); // Screen with votes for single poet
		$("ul#rooster_name").prepend(html_bout); // Screen with name of poet
		$("ul#rooster_score").prepend(html_bout); // Screen with score of poet
		$("ul#rooster_all").prepend(html_bout); // Show all votes of all poets
		$("ul#ranking").prepend(html_ranking_html); // Show ranking of poets
		$("ul#rooster_winner").prepend(html_ranking_html); // Show name of leading poet/winner
		$("ul#bout").sortable({update: _slam_rooster_sorted});
	
		_slam_show_vote();
	
		for(j=0;j<_slam_votes;j++) {
			$("div#rooster span.vote.idx"+j).css("left",(128*j)+"px");
			$("div#rooster span.vote.idx"+j).css("-webkit-transform","rotate("+(Math.floor(Math.random()*16)*0.5-4).toFixed(1)+"deg)");
		}
	
	}
	
}

/************************************************************************************************/
/*
/* Callback function for sortable
*/

function _slam_rooster_sorted() {

	var _new_slam_poets = jQuery.extend(true, {}, _slam_poets); // Copy array of objects

	console.dir(_slam_poets);
	
	for(i=0;i<_slam_poets.length;i++) {
		//_slam_poets[$("ul#bout li.poet").eq(i).data("idx")] = _new_slam_poets[i];
		_slam_poets[i] = _new_slam_poets[$("ul#bout li.poet").eq(i).data("idx")];
	}

	console.dir(_slam_poets);
	
	_slam_rooster_update();
	_slam_rooster_save();

	_slam_key_firstdigit = true;

}

/************************************************************************************************/
/*
/* Mix list of poets
*/

function _slam_rooster_mix() {

	indexe = [];

	for(i=0;i<_slam_poets.length;i++) {
		indexe.push(i);
	}

	indexe = shuffle(indexe);

	var _new_slam_poets = jQuery.extend(true, {}, _slam_poets);
	for(i=0;i<_slam_poets.length;i++) {
		_slam_poets[i] = _new_slam_poets[indexe[i]];
	}

	_slam_rooster_save();
	_slam_rooster_update();

	_slam_key_firstdigit = true;

}

/************************************************************************************************/
/*
/* Calculate the scores and the ranking
*/


function _slam_rooster_calc(_slam_rank) {

	for(i=0;i<_slam_poets.length;i++) {

		var votes = jQuery.extend(true, {}, _slam_poets[i]);

		votes = votes.votes.sort(compare);

		_slam_poets[i].streich_low = votes.shift();
		_slam_poets[i].streich_high = votes.pop();
		_slam_poets[i].score = 0;

		for(j=0;j<votes.length;j++) {
			_slam_poets[i].score += votes[j];
		}

		_slam_poets[i].score = _slam_poets[i].score.toFixed(1);

		_slam_poets[i].sort_score = pad((_slam_poets[i].score>0)?_slam_poets[i].score*10:0,4)+"_"+pad((_slam_poets[i].streich_low+_slam_poets[i].streich_high).toFixed(1)*10,4)+"_"+pad(_slam_poets[i].streich_high.toFixed(1)*10,4)+"_"+pad(_slam_poets[i].streich_low.toFixed(1)*10,4)+"_"+pad(1000-_slam_poets[i].index,4)+"_"+_slam_poets[i].name+"#"+_slam_poets[i].index;

	}

	indexe = [];
	for(i=0;i<_slam_poets.length;i++) {
		indexe.push(_slam_poets[i].sort_score+"#"+i);
	}

	if(_slam_rank) {
		indexe = indexe.sort();
		indexe = indexe.reverse();
		var _new_slam_poets = jQuery.extend(true, {}, _slam_poets);
		for(i=0;i<_slam_poets.length;i++) {
			indexe_parts = indexe[i].split("#");
			_slam_poets[indexe_parts[2]*1].ranking = i;
		}
	}

	_slam_rooster_update();
	_slam_rooster_save();
	_slam_key_firstdigit = true;

}

/************************************************************************************************/
/*
/* Show and hide features of screens
*/

function _slam_show_vote() {

	$("ul#rooster li.poet").hide();
	$("ul#rooster_score li.poet").hide();

	// Only show current poet in rooster
	$("ul#rooster_score li#poet"+_slam_vote_poet).show();
	$("ul#rooster li#poet"+_slam_vote_poet).show();

	// Highlight current vote of current poet in rooster
	$("ul#rooster li.poet span.vote").removeClass("active");
	$("ul#rooster li#poet"+_slam_vote_poet+" span.vote").eq(_slam_vote_vote).addClass("active");

	// Highlight current poet in rooster
	$("ul#rooster_name li.poet").hide();
	$("ul#rooster_name li#poet"+_slam_vote_poet).show();

	// Highlight current vote of current poet
	$("ul#rooster_all li.poet span.vote").removeClass("active");
	$("ul#rooster_all li#poet"+_slam_vote_poet+" span.vote").eq(_slam_vote_vote).addClass("active");

	$("div#rooster ul#rooster li#poet"+_slam_vote_poet+" span.vote").eq(_slam_vote_vote).css("-webkit-transform","rotate("+(Math.floor(Math.random()*16)*0.5-4).toFixed(1)+"deg)");

	// Highlight current poet in list
	$("ul#bout li.poet").removeClass("active");
	$("ul#bout li#poet"+_slam_vote_poet).addClass("active");

}

/************************************************************************************************/
/*
/* Pause and rewind all videos
*/

function video_setup() {
	videos = ["bumper","loop","werbung","slideshow","abspann"];
	for(i=0;i<videos.length;i++) {
		if(document.getElementById("v_"+videos[i])) {
			document.getElementById("v_"+videos[i]).pause();
			document.getElementById("v_"+videos[i]).currentTime = 0;
		}
	}
}


/************************************************************************************************/
/*
/* Show screens with id
*/

function _slam_rooster_show(id) {

	$("div#"+_slam_bout_screen).fadeOut("slow",function(){
		$("div.screen").hide();
		_slam_rooster_update();
		_slam_show_vote();
		_bumper_shown = 0;
		if(_show_bumper && id!="black" && id!="werbung" && id!="loop") {
			_bumper_shown = 1;
			document.getElementById("v_bumper").play();
			$("div#bumper").fadeIn(1).delay(2000).fadeOut(1);
		}
		$("div#"+id).hide().delay(2000*_bumper_shown).fadeIn();
		_slam_bout_screen = id;
	});

}


/************************************************************************************************/
/*
/*  Edit Poets
*/

function _slam_edit_poet() {

	if($("input#_slam_poet_id").val()=="") {
		_slam_poets.push(new _poet($("input#_slam_newpoet").val(),_slam_poets.length));
		$("input#_slam_newpoet").focus();
	}else{
		_slam_poets[$("input#_slam_poet_id").val()*1].name = $("input#_slam_newpoet").val();
		_slam_newpoet_hide();
	}
	$("input#_slam_newpoet").val("");
	$("input#_slam_poet_id").val("");
	_slam_rooster_save()
	_slam_rooster_update();

}

function _slam_editpoet(id) {

	
	$("section#addpoet").fadeIn();
	if(id!="") {
		$("section#addpoet p.new a").text("Abbrechen");
		$("input#_slam_newpoet").val(_slam_poets[id].name);
	}else{
		$("section#addpoet p.new a").text("Keine weiteren einfügen");
	}
	$("input#_slam_poet_id").val(id);
	$("input#_slam_newpoet").focus();

}

function _slam_newpoet_hide() {

	$("section#addpoet").fadeOut();
	$("section#addpoet p.new").show();

}

function _slam_removepoet(i) {

	_slam_poets.splice('+i+',1);
	_slam_rooster_update();
	_slam_rooster_save();

}

/************************************************************************************************/
/*
/*  Utilities
*/

function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

shuffle = function(o){ //v1.0
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};


(function() {

	/* D3  */

	var width = document.body.clientWidth;
	var height = window.innerHeight - document.querySelector('header').clientHeight - 40;

	var typeFace = 'Gorditas';
	var minFontSize = 24;
	var colors = d3.scale.category20b();

	var svg = d3.select('#cloud').append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate('+width/2+', '+height/2+')');


	function calculateCloud(wordCount) {
		d3.layout.cloud()
			.size([width, height])
			.words(wordCount)
			.rotate(function() { return ~~(Math.random()*2) * 90;}) // 0 or 90deg
			.font(typeFace)
			.fontSize(function(d) { return d.size * minFontSize; })
			.on('end', drawCloud)
			.start();
	}

	function drawCloud(words) {
		var vis = svg.selectAll('text').data(words);

		vis.enter().append('text')
			.style('font-size', function(d) { return d.size + 'px'; })
			.style('font-family', function(d) { return d.font; })
			.style('fill', function(d, i) { return colors(i); })
			.attr('text-anchor', 'middle')
			.attr('transform', function(d) {
			  return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
			})
			.text(function(d) { return d.text; });
	}
		
	/* PubNub */

	var channel = 'chat';

	var pubnub = PUBNUB.init({
		subscribe_key: 'sub-c-f762fb78-2724-11e4-a4df-02ee2ddab7fe',
		publish_key:   'pub-c-156a6d5f-22bd-4a13-848d-b5b4d4b36695'
	});

	// fetching last 100 chat room messages
	function getData() {
		pubnub.history({
	    	channel  : channel,
	    	count    : 100,
	    	callback : function(messages) {
	    		calculateCloud(processData(messages[0]));
	    	}
	    });
	}

	/* convert the raw data into a proper form of key/value obj to pass to d3.layout.cloud 
	   it should return [{text: 'str', size: n},...] 
	*/

	function processData(strings) { 
		if(!strings) return;

		// convert the array to a long string
		strings = strings.join(' ');
		
		// strip stringified objects and punctuations from the string
		strings = strings.toLowerCase().replace(/object Object/g, '').replace(/[\+\.,\/#!$%\^&\*{}=_`~]/g,'');
		
		// convert the str back in an array 
		strings = strings.split(' '); 

		// Count frequency of word occurance
		var wordCount = {};

		for(var i = 0; i < strings.length; i++) {
		    if(!wordCount[strings[i]])
		        wordCount[strings[i]] = 0;

		    wordCount[strings[i]]++; // {'hi': 12, 'foo': 2 ...}
		}

		//console.log(wordCount);

		var wordCountArr = [];

		for(var prop in wordCount) {
			wordCountArr.push({text: prop, size: wordCount[prop]});
		}
		
		return wordCountArr;
	}

	getData();

	
})();
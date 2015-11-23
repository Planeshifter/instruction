'use struct';

// MODULES //

var $ = require( 'jquery' ),
	d3 = require( 'd3' ),
	qNorm = require( 'distributions-normal-quantile' ),
	pdfNorm = require( 'distributions-normal-pdf' ),
	linspace = require( 'compute-linspace' ),
	round = require( 'compute-roundn' );

require( '@planeshifter/feedback-buttons' );

function Plot( data, id, width, height ) {
	this.data = data;
	this.id = id;
	this.margin = {top: 20, right: 20, bottom: 30, left: 50};
	this.width = width - this.margin.left - this.margin.right;
	this.height = height - this.margin.top - this.margin.bottom;
}

// FUNCTIONS //

/**
* FUNCTION: linePlot()
*	Creates and appends a line plot for supplied x and y values.
*
* @param {Object} data - object storing `x` and `y` arrays
* @returns {Void}
*/
Plot.prototype.linePlot = function linePlot() {

	var xScale = d3.scale.linear()
		.range( [0, this.width] );
	var yScale = d3.scale.linear()
		.range( [this.height, 0] );

	var xAxis = d3.svg.axis()
		.scale( xScale )
		.orient( "bottom" );

	var yAxis = d3.svg.axis()
		.scale( yScale )
		.orient( "left" );

	this.line = d3.svg.line()
		.x(function(d) { return xScale(d.x); })
		.y(function(d) { return yScale(d.y); });

	this.svg = d3.select( '#' + this.id ).append( "svg" )
		.attr( "width", this.width + this.margin.left + this.margin.right )
		.attr( "height", this.height + this.margin.top + this.margin.bottom )
		.append( "g" )
			.attr( "transform", "translate(" + this.margin.left + "," + this.margin.top + ")" );

	xScale.domain( d3.extent( this.data, function(d) { return d.x; }) );
	yScale.domain( d3.extent( this.data, function(d) { return d.y; }) );

	this.svg.append( "g" )
		.attr( "class", "x axis" )
		.attr( "transform", "translate(0," + this.height + ")" )
		.call( xAxis )
		.append( "text" )
			.attr( "x", 740 )
			.attr( "xy", ".71em" )
			.style( "text-anchor", "end" )
			.text( "x" );

	this.svg.append("g")
		.attr("class", "y axis")
		.call( yAxis )
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("density");

	this.svg.append( "path" )
		.datum( this.data )
		.attr( "class", "line" )
		.attr( "d", this.line );

}; // end FUNCTION linePlot()

/**
* FUNCTION: updateArea( val, type )
*	Shade area under the curve to the right of `val`, left of `-val` or both
*
* @param {Number} val - critical value
* @param {String} type - left, right or two-sided
* @returns {Void}
*/
Plot.prototype.updateArea = function updateArea( val, type ) {
	var area = d3.svg.area()
		.x( this.line.x() )
		.y0( this.height )
		.y1( this.line.y() );

	this.svg.selectAll( "path.area" ).remove();
	switch( type ) {
		case 'left':
			subset = this.data.filter( function(d) {
				return d.x < -val;
			});
			this.svg.append( "path" )
				.datum( subset )
				.attr( "class", "area" )
				.attr( "d" , area );
		break;
		case 'right':
			subset = this.data.filter( function(d) {
				return d.x > val;
			});
			this.svg.append( "path" )
				.datum( subset )
				.attr( "class", "area" )
				.attr( "d" , area );
		break;
		case 'two-sided':
			var leftArea = this.data.filter( function(d) {
				return d.x < -val;
			});
			this.svg.append( "path" )
				.datum( leftArea )
				.attr( "class", "area" )
				.attr( "d" , area );
			var rightArea = this.data.filter( function(d) {
				return d.x > val;
			});
			this.svg.append( "path" )
				.datum( rightArea )
				.attr( "class", "area" )
				.attr( "d" , area );
		break;
	}
}; // end FUNCTION updateArea()


/*
	Create plots, reactive elements and tooltips when document is ready.
*/
$( document ).ready( function onReady() {
	var data = {},
		plot1, plot2;

	$( '[data-toggle="tooltip"]' ).tooltip();

	// Add feedback buttons:
	$( ".fb" ).feedback({
		server: 'http://www.philipp-burckhardt.com',
		port: 3333
	});

	data = linspace( -3, 3, 100 )
		.map( function(d) {
			var o = {
				'x': d,
				'y': pdfNorm( d ),
			};
			return o;
		});

	plot1 = new Plot( data, 'plot1', 500, 250 );
	plot1.linePlot();
	var element = document.getElementById( 'example' );
	var tangle = new Tangle( element, {
		initialize: function () {
			this.alpha = 0.05;
		},
		update: function () {
			this.critical = round( qNorm( 1 - this.alpha ), -2 );
			plot1.updateArea( this.critical, 'right' );
		}
	});

	plot2 = new Plot( data, 'plot2', 500, 250 );
	plot2.linePlot();
	var element2 = document.getElementById( 'example2' );
	var tangle2 = new Tangle( element2, {
		initialize: function () {
			this.alpha = 0.05;
		},
		update: function () {
			this.critical = round( qNorm( 1 - this.alpha / 2 ), -2 );
			plot2.updateArea( this.critical, 'two-sided' );
		}
	});


	// Render Equations:

	katex.render( 'X_1, \\ldots, X_n \\sim Norm( \\mu, \\sigma^2 ) ', document.getElementById( 'eqData' ) );
	katex.render( "H_0: \\mu \\leq \\mu_0 \\qquad H_1: \\mu > \\mu_0",  document.getElementById( 'eqHypo' ) );
	katex.render( "Z = \\sqrt{n} \\frac{\\bar X-\\mu_0}{\\sigma}", document.getElementById( 'eq1' ) );
	katex.render( "H_0: \\mu = \\mu_0 \\qquad H_1: \\mu \\ne \\mu_0",  document.getElementById( 'eqHypo2' ) );
	katex.render( "z_{obs} = \\sqrt{n} \\frac{\\bar x -\\mu_0}{\\sigma} = 20 \\frac{0.03}{2} = 3", document.getElementById( 'eqZobs' ) );


	// Add Quizzes:

	new QAlity(
	{"sequence":{"nodes":[{"id":0,"type":"multiple_choice","right_value":0,"question":"If the observed value of the test statistic is \\\\( Z_{obs} = 4.2 \\\\), can we reject the null hypothesis at a significance level of \\\\( \\alpha = 0.01 \\\\)?","transition_in":"dynamic","transition_out":"dynamic","answers":[{"text":"Yes","points":1,"assessment":"ASSESSMENT"},{"text":"No","points":0,"assessment":"ASSESSMENT"}],"duration":0,"setting":null,"background":"none","element":{}},{"id":1,"type":"multiple_choice","right_value":1,"question":"If the observed value of the test statistic is \\\\( Z_{obs} = 1.5 \\\\), can we reject the null hypothesis at a significance level of \\\\( \\alpha = 0.05 \\\\)?","transition_in":"dynamic","transition_out":"dynamic","answers":[{"text":"Yes","points":0,"assessment":"ASSESSMENT"},{"text":"No","points":1,"assessment":"ASSESSMENT"}],"duration":0,"setting":null,"background":"none","element":{}}]},"evaluation":{"seperator":[{"start":0.33,"id":0},{"start":0.66,"id":1}],"sorted":[],"ranges":[{"id":0,"text":"RANGE 1","start":0,"end":0.33},{"id":1,"text":"RANGE 2","start":0.33,"end":0.66},{"id":2,"text":"RANGE 3","start":0.66,"end":1}]}},
	{
		"div": "quiz01",
		"exit": false
	});

});

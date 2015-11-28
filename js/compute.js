'use struct';

// MODULES //

global.compute = require( 'compute.io' );
global.matrix = require( 'dstructs-matrix' );


// FUNCTIONS //

var createGlobals = require( './createGlobals.js' );
createGlobals( global.compute );

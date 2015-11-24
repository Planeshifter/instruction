'use strict';

/**
* FUNCTION: createGlobals()
*	Binds all object properties to the global `window` object.
*/
function createGlobals( obj ) {
	var keys,
		i;
	keys = Object.keys( obj );
	for ( i = 0; i < keys.length; i++ ) {
		window[ keys[i] ] = obj[ keys[i] ];
	}
} // end FUNCTION createGlobals()


// EXPORTS //

module.exports = createGlobals;

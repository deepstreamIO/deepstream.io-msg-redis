var Connection = require( './Connection' ),
	util = require( 'util' );

var CacheConnector = function( options ) {
	Connection.call( this, options );
};

util.inherits( CacheConnector, Connection );

CacheConnector.prototype.delete = function( key, callback ) {
	this._client.del( key, callback );
};

CacheConnector.prototype.set = function( key, value, callback ) {
	this._client.set( key, JSON.stringify( value ), callback );
};

CacheConnector.prototype.get = function( key, callback ) {
	this._client.get( key, function( error, result ){
		var parsedResult;

		if( result === null ) {
			callback( error, null );
			return;
		}

		try {
			parsedResult = JSON.parse( result );
		} catch ( e ) {
			callback( e );
			return;
		}

		callback( null, parsedResult );
	});
};

module.exports = CacheConnector;
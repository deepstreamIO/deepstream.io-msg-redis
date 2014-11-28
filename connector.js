var redis = require( 'redis' ),
	EventEmitter = require( 'events' ).EventEmitter,
	utils = require( 'util' );

var RedisConnector = function( options ) {
	this.isReady = false;

	this._validateOptions( options );
	this._options = options;
	
	this._client = redis.createClient( options.port, options.host );
	this._client.auth( options.password, this._onAuthResult.bind( this ) );

	this._client.on( 'ready', this._onReady.bind( this ) );
	this._client.on( 'error', this._onError.bind( this ) );
	this._client.on( 'end', this._onDisconnect.bind( this ) );
};

utils.inherits( RedisConnector, EventEmitter );

RedisConnector.prototype.set = function( key, value, callback ) {
	this._client.set( key, value, callback );
};

RedisConnector.prototype.get = function( key, callback ) {
	this._client.get( key, callback );
};

RedisConnector.prototype._onAuthResult = function( error, result ) {
	if( error ) {
		throw new Error( 'Error authenticating with redis ' + error.toString() );
	}
};

RedisConnector.prototype._onReady = function() {
	this.isReady = true;
	this.emit( 'ready' );
};

RedisConnector.prototype._onError = function( error ) {
	console.log( 'REDIS error', error ); //TODO
};

RedisConnector.prototype._onDisconnect = function( error ) {
	console.log( 'REDIS disconnected', error ); //TODO
};

RedisConnector.prototype._validateOptions = function( options ) {
	if( !options.host ) {
		throw new Error( 'Missing option \'host\' for redis-connector' );
	}
	if( !options.port ) {
		throw new Error( 'Missing option \'port\' for redis-connector' );
	}
	if( !options.password ) {
		throw new Error( 'Missing option \'password\' for redis-connector' );
	}
};

module.exports = RedisConnector;

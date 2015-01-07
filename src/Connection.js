var redis = require( 'redis' ),
	EventEmitter = require( 'events' ).EventEmitter,
	utils = require( 'util' );

var Connection = function( options ) {
	this.isReady = false;

	this._validateOptions( options );
	this._options = options;
	
	this._client = redis.createClient( options.port, options.host );
	
	if( options.password ) {
		this._client.auth( options.password, this._onAuthResult.bind( this ) );
	}
	
	this._client.on( 'ready', this._onReady.bind( this ) );
	this._client.on( 'error', this._onError.bind( this ) );
	this._client.on( 'end', this._onDisconnect.bind( this ) );
};

utils.inherits( Connection, EventEmitter );


Connection.prototype._onAuthResult = function( error, result ) {
	if( error ) {
		this._onError( 'Failed to authenticate connection: ' + error.toString() );
	}
};

Connection.prototype._onReady = function() {
	this.isReady = true;
	this.emit( 'ready' );
};

Connection.prototype._onError = function( error ) {
	this.emit( 'error', 'REDIS error:' + error );
};

Connection.prototype._onDisconnect = function( error ) {
	this._onError( 'disconnected' );
};

Connection.prototype._validateOptions = function( options ) {
	if( !options.host ) {
		throw new Error( 'Missing option \'host\' for redis-connector' );
	}
	if( !options.port ) {
		throw new Error( 'Missing option \'port\' for redis-connector' );
	}
};

module.exports = Connection;

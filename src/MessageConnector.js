var Connection = require( './Connection' ),
	events = require( 'events' ),
	util = require( 'util' );

var MessageConnector = function( options ) {
	Connection.call( this, options );
	
	this._name = options.serverName || ( Math.random() * 10000000000000000000 ).toString( 36 );
	this._eventEmitter = new events.EventEmitter();
	this._publishConnection = new Connection( options );
	this._client.on( 'message', this._onMessage.bind( this ) );
};

util.inherits( MessageConnector, Connection );

MessageConnector.prototype.unsubscribe = function( topic, callback ) {
	this._client.unsubscribe( topic );
	this._eventEmitter.removeListener( topic, callback );
	this._client.on( 'unsubscribe', callback );
};

MessageConnector.prototype.subscribe = function( topic, callback ) {
	this._eventEmitter.on( topic, callback );
	this._client.subscribe( topic );
};

MessageConnector.prototype.publish = function( topic, message ) {
	message._s = this._name;
	this._publishConnection._client.publish( topic, JSON.stringify( message ) );
};

MessageConnector.prototype._onMessage = function( topic, message ) {
	var parsedMessage;

	try{
		parsedMessage = JSON.parse( message );
	} catch ( e ) {
		this._onError( 'Error parsing message ' + e.toString() );
		return;
	}

	if( parsedMessage._s === this._name ) {
		return;
	}

	delete parsedMessage._s;

	if( this._eventEmitter.listeners( topic ).length === 0 ) {
		this._onError( 'Received message for unknown topic ' + topic );
		return;
	}

	this._eventEmitter.emit( topic, parsedMessage );
};

module.exports = MessageConnector;
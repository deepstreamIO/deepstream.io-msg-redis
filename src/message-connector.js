var Connection = require( './connection' ),
	events = require( 'events' ),
	pckg = require( '../package.json' ),
	util = require( 'util' );

/**
 * MessageConnector that uses Redis' pub-sub capabilities for deepstream
 * messaging.
 *
 * Due to the forever blocking "subscriber only" nature of Redis this
 * establishes two connections to the redis server, one for up and one for
 * downstream
 *
 * @param {Object} options Redis connection options. See connection.js for details
 *
 * @author Wolfram Hempel
 * @copyright 2015 Hoxton One Ltd.
 *
 * @constructor
 */
var MessageConnector = function( options ) {
	Connection.call( this, options );
	
	this.name = pckg.name;
	this.version = pckg.version;
	
	this._senderId = options.serverName || ( Math.random() * 10000000000000000000 ).toString( 36 );
	this._eventEmitter = new events.EventEmitter();
	this._publishConnection = new Connection( options );
	this.client.on( 'message', this._onMessage.bind( this ) );
};

util.inherits( MessageConnector, Connection );

/**
 * Removes <callback> as a listener and notifies the server
 * that the client is no longer interested in messages for <topic>
 *
 * @param   {String}   topic
 * @param   {Function} callback
 *
 * @public
 * @returns {void}
 */
MessageConnector.prototype.unsubscribe = function( topic, callback ) {
	this.client.unsubscribe( topic );
	this._eventEmitter.removeListener( topic, callback );
};

/**
 * Subscribe as a listener to <topic>. Multiple subscriptions
 * to the same topic are allowed. It's up to this class 
 * to ensure that <callback> won't receive any messages published
 * by itself
 *
 * @param   {String}   topic    
 * @param   {Function} callback 
 *
 * @public
 * @returns {void}
 */
MessageConnector.prototype.subscribe = function( topic, callback ) {
	this._eventEmitter.on( topic, callback );
	this.client.subscribe( topic );
};

/**
 * Publish messages on a topic.
 *
 * This implementation will add the server name to the message to make sure
 * that the client doesn't receive messages that where send by itself
 *
 * @param   {String}   topic    
 * @param   {Function} callback 
 *
 * @public
 * @returns {void}
 */
MessageConnector.prototype.publish = function( topic, message ) {
	message._s = this._senderId;
	this._publishConnection.client.publish( topic, JSON.stringify( message ) );
};

/**
 * Callback for incoming messages. Parses the JSON stringified message,
 * checks that it hasn't been send by itself and is meant for a topic
 * that the client is subscribed to and - if so - notifies the callbacks
 *
 * @param   {String}   topic    
 * @param   {Function} callback 
 *
 * @private
 * @returns {void}
 */
MessageConnector.prototype._onMessage = function( topic, message ) {
	var parsedMessage;

	try{
		parsedMessage = JSON.parse( message );
	} catch ( e ) {
		this._onError( 'Error parsing message ' + e.toString() );
		return;
	}

	if( parsedMessage._s === this._senderId ) {
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
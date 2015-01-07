var Connection = require( './Connection' ),
	util = require( 'util' );

var MessageConnector = function( options ) {
	Connection.call( options );
};

util.inherits( MessageConnector, Connection );

MessageConnector.prototype.unsubscribe = function( topic, callback ) {
	
};

MessageConnector.prototype.subscribe = function( topic, callback ) {
	
};

MessageConnector.prototype.publish = function( topic, message ) {

};
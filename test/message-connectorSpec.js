/* global describe, it, expect, jasmine */
var MessageConnector = require( '../src/message-connector' ),
	EventEmitter = require( 'events' ).EventEmitter,
	settings = { port: 6379, host: 'localhost' },
	MESSAGE_TIME = 20;

describe( 'the message connector has the correct structure', function(){

	var messageConnector,
		errorCallback = jasmine.createSpy( 'errorCallback' );

	it( 'creates a messageConnector', function( done ){
		messageConnector = new MessageConnector( settings );
		expect( messageConnector.isReady ).toBe( false );
		messageConnector.on( 'error', errorCallback );
		messageConnector.on( 'ready', done );
	});

	it( 'implements the messageConnector interface', function() {
		expect( typeof messageConnector.subscribe ).toBe( 'function' );
		expect( typeof messageConnector.unsubscribe ).toBe( 'function' );
		expect( typeof messageConnector.publish ).toBe( 'function' );
		expect( typeof messageConnector.isReady ).toBe( 'boolean' );
		expect( typeof messageConnector.name ).toBe( 'string' );
		expect( typeof messageConnector.version ).toBe( 'string' );
		expect( messageConnector instanceof EventEmitter ).toBe( true );
	});

	it( 'throws an error when required settings are missing', function() {
		expect(function(){ new MessageConnector( 'gibberish' ) }).toThrow();
	});

	it( 'subscribes to a topic', function() {
	    messageConnector.subscribe( 'someTopic', function(){});
	});

	it( 'emits an error event when an unparsable message is received', function(){
		expect( errorCallback ).not.toHaveBeenCalled();
		messageConnector._onMessage( 'someTopic', 'gibberish' );
		expect( errorCallback.calls.length ).toBe( 1 );
	});

	it( 'emits an error event when a message is received for a topic the messageConnector isn\'t subscribed to', function(){
		messageConnector._onMessage( 'otherTopic', '{}' );
		expect( errorCallback.calls.length ).toBe( 2 );
	});
});

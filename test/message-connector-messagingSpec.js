/* global describe, it, expect, jasmine */
var MessageConnector = require( '../src/message-connector' ),
	settings = { port: 6379, host: 'localhost' },
	MESSAGE_TIME = 20;

describe( 'Messages are send between multiple instances', function(){
	var connectorA,
		connectorB,
		connectorC,
		callback_A1 = jasmine.createSpy( 'callback_A1' ),
		callback_B1 = jasmine.createSpy( 'callback_B1' ),
		callback_C1 = jasmine.createSpy( 'callback_C1' );
		
	it( 'creates connectorA', function( done ){
		connectorA = new MessageConnector( settings );
		expect( connectorA.isReady ).toBe( false );
		connectorA.on( 'ready', done );
	});
	
	it( 'creates connectorB', function(done) {
	    connectorB = new MessageConnector( settings );
	    expect( connectorB.isReady ).toBe( false );
		connectorB.on( 'ready', done );
	});
	
	it( 'creates connectorC', function(done) {
	    connectorC = new MessageConnector( settings );
	    expect( connectorC.isReady ).toBe( false );
		connectorC.on( 'ready', done );
	});
	
	it( 'initialised all three connectors', function() {
	    expect( connectorA.isReady ).toBe( true );
	    expect( connectorB.isReady ).toBe( true );
	    expect( connectorC.isReady ).toBe( true );
	});
	
	it( 'subscribes to a topic', function(){
		connectorA.subscribe( 'topic1', callback_A1 );
		connectorB.subscribe( 'topic1', callback_B1 );
		connectorC.subscribe( 'topic1', callback_C1 );
		expect( callback_A1 ).not.toHaveBeenCalled();
	});
	
	it( 'connectorB sends a message', function( done ){
		connectorB.publish( 'topic1', { some: 'data' } );
		setTimeout( done, MESSAGE_TIME );
	});
	
	it( 'connectorA and connectorC have received the message', function(){
		expect( callback_A1 ).toHaveBeenCalledWith({ some: 'data' });
		expect( callback_B1 ).not.toHaveBeenCalled();
		expect( callback_C1 ).toHaveBeenCalledWith({ some: 'data' });
	});
	
	it( 'connectorC sends a message', function( done ){
		connectorC.publish( 'topic1', { other: 'value' } );
		setTimeout( done, MESSAGE_TIME );
	});
	
	it( 'connectorA and connectorB have received the message', function(){
		expect( callback_A1 ).toHaveBeenCalledWith({ other: 'value' });
		expect( callback_B1 ).toHaveBeenCalledWith({ other: 'value' });
		expect( callback_C1 ).toHaveBeenCalledWith({ some: 'data' });
	});
	
	it( 'connectorA and connectorC send messages at the same time', function( done ){
		connectorA.publish( 'topic1', { val: 'x' } );
		connectorC.publish( 'topic1', { val: 'y' } );
		setTimeout( done, MESSAGE_TIME );
	});
	
	it( 'connectorA and connectorB have received the message', function(){
		expect( callback_A1 ).toHaveBeenCalledWith({ val: 'y' });
		expect( callback_B1 ).toHaveBeenCalledWith({ val: 'x' });
		expect( callback_B1 ).toHaveBeenCalledWith({ val: 'y' });
		expect( callback_C1 ).toHaveBeenCalledWith({ val: 'x' });
	});
	
	it( 'connectorB unsubscribes', function() {
	    connectorB.unsubscribe( 'topic1', callback_B1 );
	});
	
	it( 'connectorA sends a message', function( done ){
		connectorA.publish( 'topic1', { notFor: 'B' } );
		setTimeout( done, MESSAGE_TIME );
	});
	
	it( 'only connector c has received the message', function(){
		expect( callback_A1 ).not.toHaveBeenCalledWith({ notFor: 'B' });
		expect( callback_B1 ).not.toHaveBeenCalledWith({ notFor: 'B' });
		expect( callback_C1 ).toHaveBeenCalledWith({ notFor: 'B' });
	});
});
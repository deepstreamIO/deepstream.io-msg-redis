/* global describe, it, expect, jasmine */
const MessageConnector = require( '../src/message-connector' )
const expect = require('chai').expect
const sinon = require( 'sinon' )
const sinonChai = require("sinon-chai")
require('chai').use(sinonChai)
const EventEmitter = require( 'events' ).EventEmitter
const settings = {
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || 'localhost'
}
const MESSAGE_TIME = 20

describe( 'the message connector has the correct structure', () => {

  var messageConnector,
    errorCallback = sinon.spy()

  it( 'creates a messageConnector', ( done ) => {
    messageConnector = new MessageConnector( settings )
    expect( messageConnector.isReady ).to.equal( false )
    messageConnector.on( 'error', errorCallback )
    messageConnector.on( 'ready', done )
  })

  it( 'implements the messageConnector interface', () => {
    expect( typeof messageConnector.subscribe ).to.equal( 'function' )
    expect( typeof messageConnector.unsubscribe ).to.equal( 'function' )
    expect( typeof messageConnector.publish ).to.equal( 'function' )
    expect( typeof messageConnector.isReady ).to.equal( 'boolean' )
    expect( typeof messageConnector.name ).to.equal( 'string' )
    expect( typeof messageConnector.version ).to.equal( 'string' )
    expect( messageConnector instanceof EventEmitter ).to.equal( true )
  })

  it( 'subscribes to a topic', () => {
    messageConnector.subscribe( 'someTopic', () => {})
  })

  it( 'emits an error event when an unparsable message is received', () => {
    expect( errorCallback ).to.not.have.been.called
    messageConnector._onMessage( 'someTopic', 'gibberish' )
    expect( errorCallback ).to.have.been.calledOnce
  })

  it( 'emits an error event when a message is received for a topic the messageConnector isn\'t subscribed to', () => {
    messageConnector._onMessage( 'otherTopic', '{}' )
    expect( errorCallback ).to.have.been.calledTwice
  })
})

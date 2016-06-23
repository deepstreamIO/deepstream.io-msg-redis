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
const MESSAGE_TIME = 500

describe( 'Messages are send between multiple instances', () => {
  var connectorA,
    connectorB,
    connectorC,
    callback_A1 = sinon.spy(),
    callback_B1 = sinon.spy(),
    callback_C1 = sinon.spy()

  it( 'creates connectorA', ( done ) => {
    connectorA = new MessageConnector( settings )
    expect( connectorA.isReady ).to.equal( false )
    connectorA.on( 'ready', done )
  })

  it( 'creates connectorB', ( done ) => {
    connectorB = new MessageConnector( settings )
    expect( connectorB.isReady ).to.equal( false )
    connectorB.on( 'ready', done )
  })

  it( 'creates connectorC', ( done ) => {
    connectorC = new MessageConnector( settings )
    expect( connectorC.isReady ).to.equal( false )
    connectorC.on( 'ready', done )
  })

  it( 'initialised all three connectors', () => {
    expect( connectorA.isReady ).to.equal( true )
    expect( connectorB.isReady ).to.equal( true )
    expect( connectorC.isReady ).to.equal( true )
  })

  it( 'subscribes to a topic', () => {
    connectorA.subscribe( 'topic1', callback_A1 )
    connectorB.subscribe( 'topic1', callback_B1 )
    connectorC.subscribe( 'topic1', callback_C1 )
    expect( callback_A1 ).to.not.have.been.called
  })

  it( 'connectorB sends a message', ( done ) => {
    connectorB.publish( 'topic1', { some: 'data' } )
    setTimeout( done, MESSAGE_TIME )
  })

  it( 'connectorA and connectorC have received the message', () => {
    expect( callback_A1 ).to.have.been.calledWith({ some: 'data' })
    expect( callback_B1 ).to.not.have.been.called
    expect( callback_C1 ).to.have.been.calledWith({ some: 'data' })
  })

  it( 'connectorC sends a message', ( done ) => {
    connectorC.publish( 'topic1', { other: 'value' } )
    setTimeout( done, MESSAGE_TIME )
  })

  it( 'connectorA and connectorB have received the message', () => {
    expect( callback_A1 ).to.have.been.calledWith({ other: 'value' })
    expect( callback_B1 ).to.have.been.calledWith({ other: 'value' })
    expect( callback_C1 ).to.have.been.calledWith({ some: 'data' })
  })

  it( 'connectorA and connectorC send messages at the same time', ( done ) => {
    connectorA.publish( 'topic1', { val: 'x' } )
    connectorC.publish( 'topic1', { val: 'y' } )
    setTimeout( done, MESSAGE_TIME )
  })

  it( 'connectorA and connectorB have received the message', () => {
    expect( callback_A1 ).to.have.been.calledWith({ val: 'y' })
    expect( callback_B1 ).to.have.been.calledWith({ val: 'x' })
    expect( callback_B1 ).to.have.been.calledWith({ val: 'y' })
    expect( callback_C1 ).to.have.been.calledWith({ val: 'x' })
  })

  it( 'connectorB unsubscribes', () => {
    connectorB.unsubscribe( 'topic1', callback_B1 )
  })

  it( 'connectorA sends a message', ( done ) => {
    connectorA.publish( 'topic1', { notFor: 'B' } )
    setTimeout( done, MESSAGE_TIME )
  })

  it( 'only connector c has received the message', () => {
    expect( callback_A1 ).to.not.have.been.calledWith({ notFor: 'B' })
    expect( callback_B1 ).to.not.have.been.calledWith({ notFor: 'B' })
    expect( callback_C1 ).to.have.been.calledWith({ notFor: 'B' })
  })
})

// ioredis API does not have on('subscribe') and on('unsubscribe')
xdescribe( 'Channels are subscribed and unsubscribed when neccessary', () => {
  //provide some setup before test
  var connectorA
  it( 'subscribes to a channel only once', ( done ) => {
    connectorA = new MessageConnector( settings )
    //check subscription only happens once when subscribing
    connectorA.client.on('subscribe', (channel, count) => {
      expect(count).to.equal(1)
    })
    connectorA.on('ready', () => {
      //subscribe once
      connectorA.subscribe('testtopic1', () => {})
      //subscribe twice
      connectorA.subscribe('testtopic1', () => {})
      //wait for any 'subscribe' even to fire, then mark as done
      setTimeout(() => {
        connectorA.client.end(true)
        done()
      }, MESSAGE_TIME)
    })
  } )

  it( 'does not unsubscribe from a channel when still has subscriber', ( done ) => {
    //check subscription only happens once when subscribing
    connectorA = new MessageConnector( settings )
    connectorA.client.on('unsubscribe', (channel, count) => {
      throw new Error('Should not have unsubscribed')
    })
    connectorA.on('ready', () => {
      var fn1 = () => {}
      //if this function gets called then test is successful as it was still subscribed
      var fn2 = () => {
        connectorA.client.end(true)
        done()
      }
      //subscribe once
      connectorA.subscribe('testtopic1', fn1)
      //subscribe twice
      connectorA.subscribe('testtopic1', fn2)
      //unsubscribe once
      connectorA.unsubscribe('testtopic1', fn1)
      //publish a topic to test subscription is still held
      connectorA.publish('testtopic1', 'test')
    })
  } )
  it( 'does unsubscribe from a channel when it has no more subscribers', ( done ) => {
    //check subscription only happens once when subscribing
    connectorA = new MessageConnector( settings )
    //when client is unsubscribed then we have success
    connectorA.client.on('unsubscribe', (channel, count) => {
      connectorA.client.end(true)
      done()
    })
    connectorA.on('ready', () => {
      var fn1 = () => {}
      //if this function gets called then test is successful as it was still subscribed
      var fn2 = () => {}
      //subscribe once
      connectorA.subscribe('testtopic1', fn1)
      //subscribe twice
      connectorA.subscribe('testtopic1', fn2)
      //unsubscribe once
      connectorA.unsubscribe('testtopic1', fn1)
      //unsubscribe twice
      connectorA.unsubscribe('testtopic1', fn2)
    })
  } )
})

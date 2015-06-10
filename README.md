deepstream.io-msg-redis [![npm version](https://badge.fury.io/js/deepstream.io-msg-redis.svg)](http://badge.fury.io/js/deepstream.io-msg-redis)
===================

[deepstream](http://deepstream.io) message connector for [redis](http://redis.io/)

This connector uses [the npm redis package](https://www.npmjs.com/package/redis). Please have a look there for detailed options.

##Basic Setup
```javascript
var Deepstream = require( 'deepstream.io' ),
    RedisMessageConnector = require( 'deepstream.io-msg-redis' ),
    server = new Deepstream();

server.set( 'messageConnector', new RedisMessageConnector( { 
  port: 5672, 
  host: 'localhost' 
}));

server.start();
```


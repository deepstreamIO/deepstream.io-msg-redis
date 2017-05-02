deepstream.io-msg-redis [![npm version](https://badge.fury.io/js/deepstream.io-msg-redis.svg)](http://badge.fury.io/js/deepstream.io-msg-redis)
===================

[![Greenkeeper badge](https://badges.greenkeeper.io/deepstreamIO/deepstream.io-msg-redis.svg)](https://greenkeeper.io/)

[deepstream](http://deepstream.io) message connector for [redis](http://redis.io/)

This connector uses [the npm ioredis package](https://www.npmjs.com/package/ioredis). Please have a look there for detailed options.

## Install via
```bash
deepstream install message redis
```

## Example configuration 
```yaml
plugins:
  cache:
    name: redis
    options:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT}

# Using with a cluster
# plugins:
#   cache:
#     name: redis
#     options:
#       nodes:
#         - host: <String>
#           port: <Number>
#           password: <String>
#         - host: <String>
#           port: <Number>
#       redisOptions:
#         password: 'fallback-password'
#         maxRedirections: 16
```

## Usage in node
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


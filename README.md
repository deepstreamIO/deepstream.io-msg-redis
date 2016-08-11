deepstream.io-msg-redis [![npm version](https://badge.fury.io/js/deepstream.io-msg-redis.svg)](http://badge.fury.io/js/deepstream.io-msg-redis)
===================

[deepstream](http://deepstream.io) message connector for [redis](http://redis.io/)

This connector uses [the npm redis package](https://www.npmjs.com/package/redis). Please have a look there for detailed options.

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
#       maxRedirections: 16
#       redisOptions:
#         password: 'fallback-password'
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


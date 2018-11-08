const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisURL = 'redis://127.0.0.1:6379';

const client = redis.createClient(redisURL);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

//
mongoose.Query.prototype.cache = function(options = {}) {
  this._cache = true;
  this._hkey = JSON.stringify(options.key || 'default');

  //return this in order for it to be chainable
  return this;
}

//overload exec function in the Query class
mongoose.Query.prototype.exec = async function() {
  if(!this._cache){
    return exec.apply(this, arguments);
  }

  //create key
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  //is the required data in the cache
  const cacheValue = await client.hget(this._hkey, key);

  if(cacheValue){
    console.log('Serving from cache');
    const doc = JSON.parse(cacheValue);

    const result = Array.isArray(doc)
      ? doc.map(p => new this.model(p))
      : new this.model(doc);

    return result;
  }

  //if data is not on cache
  const result = await exec.apply(this, arguments);

  client.hset(this._hkey, key, JSON.stringify(result), 'EX', 10);
  return result;
}


module.exports = {
  clearHash(hashKey){
    client.del(JSON.stringify(hashKey));
  }
}

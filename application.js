var http = require('http');
var Redis = require('redis');
var Memcached = require('memcached');



var app = exports = module.exports = {};


var lecache = {};
var dbConfig = {}, memcached = null, redis = null;
var isInit = false;


app.initDB = function (config) {
    dbConfig = config;
    if (dbConfig && dbConfig.Memcached && dbConfig.Memcached.host && dbConfig.Memcached.port && dbConfig.Memcached.isOpen) {
        try {
            memcached = new Memcached(dbConfig.Memcached.host + ':' + dbConfig.Memcached.port);
            return memcached;
        } catch (e) {
            return 'redis init err:' + e.stack;
        }
    }
    if (dbConfig && dbConfig.Redis && dbConfig.Redis.host && dbConfig.Redis.port && dbConfig.Redis.isOpen) {
        try {
            return redis = redis.createClient();
        } catch (e) {
            return 'memcache init err:' + e.stack;
        }
    }
};

app.getMemcached = {
    urlRequest: getUrlData,
    nativeHash: ''
};

var getMemcachedClient = function () {
    if (memcached == null) {
        if (dbConfig && dbConfig.Memcached && dbConfig.Memcached.host && dbConfig.Memcached.port && dbConfig.Memcached.isOpen) {
            try {
                memcached = new Memcached(dbConfig.Memcached.host + ':' + dbConfig.Memcached.port);
            } catch (e) {
                // return memcached;
            }
        } else {
            return null;
        }
    } else {
        return memcached;
    }
};

app.getRedis = function () {
    if (redis == null) {
        if (dbConfig && dbConfig.Redis && dbConfig.Redis.host && dbConfig.Redis.port && dbConfig.Redis.isOpen) {
            try {
                return redis = redis.createClient();
            } catch (e) {
                return redis;
            }
        } else {
            return null;
        }
    } else {
        return redis;
    }
}();

function getUrlData (url, option) {
    var promise = new Promise(function (resolve, reject) {
        getMemcachedClient().get(option.key, function (err, data) {
            if (err || !data) {
                http.get(url, (res) => {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => rawData += chunk);
                    res.on('end', () => {
                        try {
                            let parsedData = JSON.parse(rawData);
                            getMemcachedClient().set(option.key, rawData, 10, function (err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(parsedData);
                                }
                            });
                        } catch (err) {
                            reject(err);
                            console.log(e.message);
                        }
                    });
                }).on('error', (err) => {
                    console.log(`Got error: ${e.message}`);
                    reject(err);
                });
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
    //promise.then(function (resolve) {
    //    return resolve;
    //}, function (error) {
    //    console.error(error);
    //    return error;
    //});
    return promise;
}

process.on('uncaughtException', function (err) {
    console.info(err.stack);
});






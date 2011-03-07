var sys = require('sys'),
  http = require('http'),
  _ = require('underscore'),
  rest = require('restler'),
  redis = require("redis"),
  redisClient = redis.createClient();

describe("POST /javascript", function() {
  var urls, cacheKeys, responseEnd, json;
  beforeEach(function() {
    responseEnd = false;
    urls = [
      "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js",
      "http://ajax.googleapis.com/ajax/libs/dojo/1.5.0/dojo/dojo.xd.js"
    ];
    json = JSON.stringify(urls);

    cacheKeys = [
      "node-asset-server:http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js",
      "node-asset-server:http://ajax.googleapis.com/ajax/libs/dojo/1.5.0/dojo/dojo.xd.js"
    ];
    var uncachedFiles = _(cacheKeys).inject(function(memo, file) {
      memo[file] = false;
      return memo;
    }, {});
    _(cacheKeys).each(function(key) {
      redisClient.del(key, function() {
        uncachedFiles[key] = true;
      });
    });
    waitsFor(function() {
      return _(cacheKeys).all(function(key) {
        return uncachedFiles[key];
      });
    });
  });

  it("combines the posted urls into a single file", function() {
    var connection = http.createClient(8124, "127.0.0.1");

    rest.post("http://127.0.0.1:8124/javascript", {
      data: json
    }).on("complete", function(body) {
      expect(body).toContain("jQuery");
      expect(body).toContain("dojotoolkit");
      expect(body.indexOf("jQuery")).toBeLessThan(body.indexOf("dojotoolkit"));
      expect(body).toNotContain("Copyright");
      responseEnd = true;
    });

    waitsFor(function() {
      return responseEnd;
    });
    _(cacheKeys).each(function(key) {
      var cached = false;
      var checkCache = function() {
        redisClient.get(key, function(err, value) {
          if (value) {
            cached = true;
          } else {
            checkCache();
          }
        });
      };
      checkCache();
      waitsFor(function() {
        return cached;
      });
    });
  });

  describe("when the files have been cached", function() {
    beforeEach(function() {
      _(cacheKeys).each(function(key) {
        redisClient.set(key, "// " + key);
      });
      var cachedFiles = _(cacheKeys).inject(function(memo, file) {
        memo[file] = false;
        return memo;
      }, {});

      _(cacheKeys).each(function(key) {
        redisClient.set(key, "// " + key, function() {
          cachedFiles[key] = true;
        });
      });

      waitsFor(function() {
        return _(cacheKeys).all(function(key) {
          return cachedFiles[key];
        });
      });
    });

    it("serves the cached files", function() {
      rest.post("http://127.0.0.1:8124/javascript", {
        data: json
      }).on("complete", function(body) {
        expect(body).toContain("// node-asset-server:http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
        expect(body).toContain("// node-asset-server:http://ajax.googleapis.com/ajax/libs/dojo/1.5.0/dojo/dojo.xd.js");
        responseEnd = true;
      });

      waitsFor(function() {
        return responseEnd;
      });
    });
  });
});
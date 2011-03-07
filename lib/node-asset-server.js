require.paths.push("./vendor/restler/lib");
var sys = require('sys'),
  http = require('http'),
  _ = require('underscore'),
  url = require('url'),
  rest = require('restler'),
  uglifyParser = require("uglify-js").parser,
  uglify = require("uglify-js").uglify,
  redis = require("redis"),
  redisClient = redis.createClient(),
  app = require('express').createServer();

function start() {
  app.listen(8124);
  console.log('Server running at http://127.0.0.1:8124/');
}

app.post("/javascript", function(request, response) {
  var json = "";
  request.addListener("data", function(chunk) {
    json += chunk;
  });
  request.addListener("end", function() {
    var files = _(JSON.parse(json)).map(function(fileUrl) {
      return {
        url: fileUrl,
        content: "",
        finished: false
      }
    });

    var onFileFinished = function() {
      if (files.length == 0) {
        response.end();
        return;
      } else {
        if (files[0].finished) {
          var file = files.shift();
          response.write(file.content);
          response.write("\n");
          onFileFinished();
        }
      }
    };

    var finishFile = function(file, str) {
      file.content = str;
      file.finished = true;
      onFileFinished();
    };

    _(files).each(function(file) {
      var cacheKey = "node-asset-server:" + file.url;
      redisClient.get(cacheKey, function(err, reply) {
        if (reply) {
          finishFile(file, reply);
        } else {
          rest.get(file.url).on("complete", function(str) {
            var ast = uglifyParser.parse(str); // parse code and get the initial AST
            ast = uglify.ast_mangle(ast); // get a new AST with mangled names
            ast = uglify.ast_squeeze(ast); // get an AST with compression optimizations
            var minfiedStr = uglify.gen_code(ast);

            redisClient.set(cacheKey, minfiedStr);
            finishFile(file, minfiedStr);
          });
        }
      });
    });
  });
});

exports.start = start;

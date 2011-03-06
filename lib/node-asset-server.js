var sys = require('sys');
var http = require('http');
var _ = require('underscore');
var url = require('url');
var get = require('node-get');

exports.start = function() {
  http.createServer(exports.loop).listen(8124, "127.0.0.1");
  console.log('Server running at http://127.0.0.1:8124/');
};
exports.loop = function(request, response) {
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

    _(files).each(function(file) {
      var dl = new get(file.url);
      dl.asString(function(err, str) {
        file.content += str;
        file.finished = true;
        onFileFinished();
      });
    });
  });
};

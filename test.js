var sys = require('sys');
var http = require('http');
var _ = require('underscore');

http.createServer(function (request, response) {
  var json = "";
  request.addListener("data", function(chunk) {
    json += chunk;
  });
  request.addListener("end", function() {
    var files = _(JSON.parse(response.output)).map(function(url) {
      return {
        url: url,
        content: "",
        finished: false
      }
    });

    var fileFinished = function() {
      if (content.length == 0) {
        response.end();
        return;
      } else {
        if (content[0].finished) {
          var data = content.shift();
          response.write(data.content, 'binary');
        }
      }
    };

    _(files).each(function(file) {
      var proxy = http.createClient(80, "google.com");
      var proxyRequest = proxy.request(request.method, request.url, request.headers);
      proxyRequest.addListener('response', function (proxyResponse) {
        proxyResponse.addListener('data', function(chunk) {
          data.content += chunk;
        });
        proxyResponse.addListener('end', function() {
          content.finished = true;
        });
      })
    });
  });

//  proxyRequest.addListener('response', function (proxyResponse) {
//    proxyResponse.addListener('data', function(chunk) {
//      response.write(chunk, 'binary');
//    });
//    proxyResponse.addListener('end', function() {
//      response.end();
//    });
//    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
//  });
//  request.addListener('data', function(chunk) {
//    proxyRequest.write(chunk, 'binary');
//  });
//  request.addListener('end', function() {
//    proxyRequest.end();
//  });
}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');

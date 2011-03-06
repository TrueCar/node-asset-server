var sys = require('sys');
var http = require('http');
var get = require('node-get');

describe("node-asset-server.loop", function() {
  it("combines the posted urls into a single file", function() {
    var connection = http.createClient(8124, "127.0.0.1");

    var json = JSON.stringify(
      [
        "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"
      ]
    );
    var request = connection.request("POST", "/", {
      "Content-Length": json.length
    });
    request.write(json);
    request.end();

    var responseEnd = false;
    request.addListener("response", function(response) {
      var body = "";
      response.addListener('data', function(chunk) {
        body += chunk;
      });
      response.addListener('end', function() {
        expect(body).toContain("jQuery");
        responseEnd = true;
      });
    });
    waitsFor(function() {
      return responseEnd;
    });
  });
});
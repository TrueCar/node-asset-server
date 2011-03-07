var sys = require('sys');
var http = require('http');
var rest = require('restler');

describe("node-asset-server.loop", function() {
  it("combines the posted urls into a single file", function() {
    var connection = http.createClient(8124, "127.0.0.1");

    var json = JSON.stringify(
      [
        "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js",
        "http://ajax.googleapis.com/ajax/libs/dojo/1.5.0/dojo/dojo.xd.js"
      ]
    );
    var responseEnd = false;
    rest.post("http://127.0.0.1:8124/", {
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
  });
});
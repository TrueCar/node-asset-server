var sys = require('sys');
var http = require('http');
var server = require('node-asset-server');

//describe("node-asset-server.loop", function() {
//  it("combines the posted urls into a single file", function() {
//    var request = {
//      listeners: {}
//    };
//    var response = {};
//
//    request.addListener = function(key, fn) {
//      if (key == "data") {
//        request.listeners.data = fn;
//        fn("// jQuery");
//      } else if (key == "end") {
//        request.listeners.end = fn;
//      }
//    };
//  });
//});
require.paths.push("./vendor/restler/lib");
var sys = require('sys');
var http = require('http');
var _ = require('underscore');
var url = require('url');
var rest = require('restler');
var jsp = require("uglify-js/lib/parse-js");
var pro = require("uglify-js/lib/process");

function start() {
  http.createServer(exports.loop).listen(8124, "127.0.0.1");
  console.log('Server running at http://127.0.0.1:8124/');
}

function loop(request, response) {
  var json = "";
  request.addListener("data", function(chunk) {
    json += chunk;
  });
  request.addListener("end", function() {
    processResponse(json, response);
  });
}

function processResponse(json, response) {
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
        var ast = jsp.parse(file.content); // parse code and get the initial AST
        ast = pro.ast_mangle(ast); // get a new AST with mangled names
        ast = pro.ast_squeeze(ast); // get an AST with compression optimizations

        response.write(pro.gen_code(ast));
        response.write("\n");
        onFileFinished();
      }
    }
  };

  _(files).each(function(file) {
    rest.get(file.url).on("complete", function(str) {
      file.content += str;
      file.finished = true;
      onFileFinished();
    });
  });
}

exports.start = start;
exports.loop = loop;

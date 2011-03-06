watch( 'lib/(.*)\.js' ) do |md|
  system("node lib/node-asset-server.js")
end
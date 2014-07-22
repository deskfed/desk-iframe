
var koa = require('koa');
var onFinished = require('finished');
var fs = require('fs');
var app = module.exports = koa();
var path = require('path');
var extname = path.extname;

// try GET /app.js

app.use(function *(){
  var path = __dirname + this.path;
  this.type = extname(path);
  this.body = fs.createReadStream(path);
});

var port = Number(process.env.PORT || 3000);

if (!module.parent) {
  app.listen(port);
  console.log('Listening on port',port);
}

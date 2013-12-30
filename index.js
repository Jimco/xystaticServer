// var sys = require('sys')
//   , circle = require('./circle');


// sys.puts('Hello world!');                 // 也可以这样用： require('sys').print(“Hello world!”); 

// console.log('Version: ' + process.version);           // nodejs版本号  
// console.log('Prefix: ' + process.installPrefix);      // 安装目录  
// console.log('This process is pid ' + process.pid);    // 系统进程id  
// console.log('This platform is ' + process.platform);  // 运行平台  
// console.log(sys.inspect(process.memoryUsage()));      // 使用内存的情况 
// console.log( 'The area of a circle of radius 4 is '+ circle.area(4));

// var app = require('http').createServer(handler)
//   , io = require('socket.io').listen(app)
//   , fs = require('fs')

// app.listen(9000);

// function handler (req, res) {
//   fs.readFile(__dirname + '/index.html',
//   function (err, data) {
//     if (err) {
//       res.writeHead(500);
//       return res.end('Error loading index.html');
//     }

//     res.writeHead(200);
//     res.end(data);
//   });
// }

// io.sockets.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });

var PORT = 9000
  , http = require('http')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , mime = require("./mime").types
  , config = require("./config");

var server = http.createServer(function(request, response){
      // TODO
      response.setHeader("Server", "Node/V5");
      response.setHeader('Accept-Ranges', 'bytes');
      
      var pathname = url.parse(request.url).pathname
        , realPath = 'assets' + pathname
        , ext = path.extname(realPath);

      ext = ext ? ext.slice(1) : 'unknown';

      if(ext.match(config.Expires.fileMatch)){
        var expires = new Date();
        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
        response.setHeader('Expires', expires.toUTCString());
        response.setHeader('Cache-Control', 'max-age=' + config.Expires.maxAge);
      }



      fs.stat(realPath, function(err, stat){
        var lastModified = stat.mtime.toUTCString();

        console.log(request.headers);
        if(request.headers['if-modified-since'] && lastModified == request.headers['if-modified-since']){
          response.writeHead(304, 'Not Modified');
          response.end();
        }

        response.setHeader('Last-Modified', lastModified);
      });

      path.exists(realPath, function(exists){
        var contentType = mime[ext] || 'text/plain';

        if(!exists){
          response.writeHead(404, {
            'Content-type': 'text/plain'
          });
          response.write('The Request URL: '+ pathname +' was not found on this server.');
          response.end();
        }
        else{
          fs.readFile(realPath, 'binary', function(err, file){
            if(err){
              response.writeHead(500, {
                'Content-type': contentType
              });

              response.end(err);
            }
            else{
              response.writeHead(200, {
                'Content-type': contentType
              });
              response.write(file, 'binary');
              response.end();
            }

          });
        }

      });

      // response.write(pathname);
      // response.end();
  });

server.listen(PORT);
console.log('Server running at port: '+ PORT +'.');

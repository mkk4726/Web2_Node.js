var http = require('http');
var fs = require('fs');
var url = require('url');

const template = require('./libs/templates');
const path = require('path');
const { template_list } = template;
const { template_body} = template;

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;
  
  if (pathname === '/') {
    if (title === undefined) {
      title = 'INDEX'};
    
    fs.readdir('./data', function (err, filelist){      
      fs.readFile(`./data/${title}`, 'utf8', function(err, description) {
        let list = template_list(filelist);
        let body = template_body(title, list , description);
        response.writeHead(200);
        response.end(body);
        })
      })
  } else if (pathname === '/create') {
    fs.readdir('./data', function (err, filelist) {
      let title = 'create'; 
      let list = template_list(filelist);
      let description = `
      <form action="http://localhost:3000/process_create" method="post"> 
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>`
      let body = template_body(title, list, description);
      response.writeHead(200);
      response.end(body);
    })
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }
})

app.listen(3000);
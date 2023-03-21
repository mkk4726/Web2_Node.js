var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

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
        let body = template_body(title, list , description,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
        response.writeHead(200);
        response.end(body);
        })
      })
  } else if (pathname === '/create') {
    fs.readdir('./data', function (err, filelist) {
      let title = 'create'; 
      let list = template_list(filelist);
      let description = `
      <form action="/create_process" method="post"> 
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>`
      let body = template_body(title, list, description,
        ``);
      response.writeHead(200);
      response.end(body);
    }) 
  } else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function(data) {
      body += data;
    
      if (body.length > 1e6) {
        request.connection.destroy();
      }
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', err => {
        if (err) {
          console.error(err);
        }
      });
      response.writeHead(302, {Location: `/?id=${title}`});
      response.end('success');
    })} else if (pathname === `/update`) {
      fs.readdir('./data', function (err, filelist){      
        fs.readFile(`./data/${title}`, 'utf8', function(err, description) {
          let list = template_list(filelist);
          let body = template_body(title, list , 
            `
            <form action="/update_process" method="post"> 
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>`,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(body);
        });
      });
    } else {
    response.writeHead(404);
    response.end('Not found');
  }
})

app.listen(3000);
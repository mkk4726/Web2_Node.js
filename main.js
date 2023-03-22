var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
const path = require('path');

const template = require('./libs/templates');
const { template_list, template_body} = template;

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;
  
  if (pathname === '/') {
    if (queryData.id === undefined) {
      queryData.id = 'INDEX'
    
    };
    fs.readdir('./data', function (err, filelist){   
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`./data/${filteredId}`, 'utf8', function(err, description) {
        let list = template_list(filelist);
        let body = template_body(queryData.id, list , description,
          `<a href="/create">create</a>
          <a href="/update?id=${filteredId}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${filteredId}">
            <input type="submit" value="delete">
          </form>
          `);
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
      var filteredId = path.parse(queryData.id).base;
      fs.readdir('./data', function (err, filelist){      
        fs.readFile(`./data/${filteredId}`, 'utf8', function(err, description) {
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
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      
        if (body.length > 1e6) {
          request.connection.destroy();
        }
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;

        fs.rename(`data/${id}`, `data/${title}`, (err) => {
          // console.log(err);
          fs.writeFile(`data/${title}`, description, 'utf8', err => {
            if (err) {
              // console.error(err);
            }
          });
        })
        
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end('success');
       
      })

    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data) {
        body += data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;

        var filteredId = path.parse(id).base;
        fs.unlink(`./data/${filteredId}`, (err) => {
          // console.log(err);
        })

        response.writeHead(302, {Location: `/`});
        response.end('success');
        
        })
    } else {
    response.writeHead(404);
    response.end('Not found');
  }
})

app.listen(3000);
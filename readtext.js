var fs = require('fs');

fs.readFile('sample.txt', 'utf8', function (error, data) {
  console.log(data);
})
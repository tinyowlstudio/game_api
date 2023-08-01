const http = require("http"), //variable assigned to the imported HTTP module
  fs = require("fs"),   // file system module
  url = require("url"); //url module

http.createServer((request, response) => {  //request handler; function from HTTP module
    //used to create a new server
    //request is sent to the server, response is what the server returns


    //   response.writeHead(200, {'Content-Type': 'text/plain'});
    //   response.end('Hello Node!\n');

    let addr = request.url, //gets url from request
      q = url.parse(addr, true),    //returns url object with each part of the address as properties
      filePath = "";    //where the path of the file will be stored


      //appends log every time accessed
      fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Added to log.');
        }
      });



    if (q.pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html"; //if the pathname includes documentation, get the exact pathway
    } else {
      filePath = "index.html";  //otherwise just get the path of index.html
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;  //if theres an error reading the file using the filepath, throw an error
      }
      //if file is read succesfully, write the data
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end();
    });
  })
  .listen(8080); //listen for requests from port 8080 (standard port)

console.log("My first Node test server is running on Port 8080.");

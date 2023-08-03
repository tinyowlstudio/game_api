const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path");
const app = express(); //app stores the express module

//For errors
const bodyParser = require("body-parser"),
  methodOverride = require("method-override");





  //an array of games to show
let games = [
  {
    title: "The Legend of Zelda: Tears of the Kingdom",
    author: "Nintendo",
  },
  {
    title: "Guild Wars 2",
    author: "Arenanet",
  },
  {
    title: "The Last of Us Part I",
    author: "Naughty Dog",
  },
];




//logger for terminal only, not to write in log.txt
  app.use(morgan('common')); 

//This speciically to append logs in log.txt
// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));







// GET requests
app.get("/", (req, res) => {
  res.send("This is a test");
});


//   app.get('/documentation', (req, res) => {
//     res.sendFile('public/documentation.html', { root: __dirname });
//   });
//Replaced above with static, which gets everything in the public folder
app.use(express.static("public"));


app.get("/games", (req, res) => {
  res.json(games);
});







//Error Handling
// MUST BE PLACED BEFORE app.listen
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});






app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});

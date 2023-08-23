const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path"),
  app = express(), //app stores the express module
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  uuid = require("uuid");


const mongoose = require('mongoose');
const Models = require('./models.js');
const Games = Models.Game;
const Users = Models.User;
// //local database
// mongoose.connect('mongodb://localhost:27017/videogameDB', { useNewUrlParser: true, useUnifiedTopology: true });
//connect to either local or online DB based on where its being run
mongoose.connect( process.env.CONNECTION_URI || 'mongodb://localhost:27017/videogameDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());


//logger for terminal only, not to write in log.txt
app.use(morgan("common"));

//Error Handling
// MUST BE PLACED BEFORE app.listen
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


//Check origin
const cors = require('cors');
app.use(cors()); //allows all origins



//links auth.js
let auth = require('./auth')(app);
//link passport module and js file
const passport = require('passport');
require('./passport');

//Server-side validation
const { check, validationResult } = require('express-validator');









// CRUD FOR USERS ARRAY
//=========================================
// CREATE
//push new user onto array
app.post('/users', 
// Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('username', 'Username must be at least 5 characters long').isLength({min: 5}),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
  ],
async (req, res) => {
// check the validation object for errors
let errors = validationResult(req);
//if there are errors, do not execute the rest of the code
if (!errors.isEmpty()) { //means if errors are not empty
  return res.status(422).json({ errors: errors.array() });
}

  //encrypts the password and stores it in a variable
  let hashedPassword = Users.hashPassword(req.body.password);

  await Users.findOne({ Username: req.body.username }) //check to see if the username exists
    .then((user) => { //if it does then say that the username already exists
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {  //otherwise add the new user onto the collection
        Users 
          .create({
            username: req.body.username, //req.body is something the user sends
            password: hashedPassword, //store the encrypted password
            email: req.body.email,
            birthday: req.body.birthday
          })
          .then((user) =>{res.status(201).json(user) }) // then show the newly added user data
        .catch((error) => { //if mongoose catches any errors, like no username, then throw the error
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


// CREATE
// push a new game onto the favorite games array
app.post('/users/:username/games/:gameID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  //If the user isn't the name user inputted in :Username, it denies the user
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
}


  await Users.findOneAndUpdate({ username: req.params.username }, { //find the user collection using the username
     $push: { favoriteGames: req.params.gameID }  //add the new game onto the favorite game list
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => { 
    res.json(updatedUser); //return the updated user data
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// READ
// To get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  //If the user isn't the name user inputted in :Username, it denies the user
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
}

  await Users.find() //grabs all documents in user collection
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// READ
// get a single user using the username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  //If the user isn't the name user inputted in :Username, it denies the user
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
}

  await Users.findOne({ Username: req.params.username }) //finds the collection and uses username as the parameter
    .then((user) => {
      res.json(user); //then return the user
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// UPDATE
// update user name using username
app.put('/users/:username', 
[//optional is placed incase the field is not included in the set to update
  check('username', 'Username must be at least 5 characters long').isLength({min: 5}).optional(),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric().optional(),
  check('password', 'Password is required').not().isEmpty().optional(),
  check('email', 'Email does not appear to be valid').isEmail().optional()
],
passport.authenticate('jwt', { session: false }), async (req, res) => {
// check the validation object for errors
let errors = validationResult(req);
//if there are errors, do not execute the rest of the code
if (!errors.isEmpty()) { //means if errors are not empty
  return res.status(422).json({ errors: errors.array() });
}

  //If the user isn't the name user inputted in :Username, it denies the user
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
}

//the hashed password function will create and error
//if the field is not included in the update, so the 
//code needs to accomodate for any missing fields if
//the user doesn't need to update everything
let updates = {};
if (req.body.username) {
  updates.username = req.body.username;
}
if (req.body.password) {
  //hashed function placed here only if the password field is included
  const hashedPassword = Users.hashPassword(req.body.password); 
  updates.password = hashedPassword;
}
if (req.body.email) {
  updates.email = req.body.email;
}
if (req.body.birthday) {
  updates.birthday = req.body.birthday;
}

// Update only the specified fields
await Users.findOneAndUpdate(
  { username: req.params.username },
  { $set: updates },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser); //show the updated user
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});

// DELETE
// remove game from the array
app.delete('/users/:username/games/:gameID', passport.authenticate('jwt', { session: false }),  async (req, res) => {
  //If the user isn't the name user inputted in :Username, it denies the user
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
}

  await Users.findOneAndUpdate({ username: req.params.username }, { //find the user collection using the username
     $pull: { favoriteGames: req.params.gameID }  //remove the game from the favorite game list
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => { 
    res.json(updatedUser); //return the updated user data
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// DELETE
// remove user from array
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  //If the user isn't the name user inputted in :Username, it denies the user
  if(req.user.username !== req.params.username){
    return res.status(400).send('Permission denied');
}

  await Users.findOneAndRemove({ Username: req.params.username }) //find the user using username and delete them
    .then((user) => {
      if (!user) { //if the username can't be found/doesnt exist
        res.status(400).send(req.params.username + ' was not found');
      } else {  //otherwise delete the document data
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});











// CRUD FOR GAMES ARRAY (ONLY READ)
//=========================================
app.get("/", (req, res) => {
  res.send("This is a test");
});

//Replaced above with static, which gets everything in the public folder
app.use(express.static("public"));

// get all games
app.get("/games", async (req, res) => {
  Games.find()
  .then((games)=> {
    res.status(200).json(games);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send("Error: " + err);
  })
});

// get all data of a single game
app.get('/games/:title', async (req, res) => { 
  await Games.findOne({ title: req.params.title }) //finds the collection and uses title of the game as the parameter
    .then((game) => {
      if (game){
        res.json(game); //then return the game
      } else{
        res.status(400).send('Game not found');
      }
      
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get all data of a single developer
app.get('/developers/:developerName', passport.authenticate('jwt', { session: false }), async (req, res) => { // NOTE TO SELF: req.params.developerName is derived from :developerName
  await Games.findOne({ "developer.name": req.params.developerName }) //finds the first game with the same developer name as the parameter
    .then((game) => {
      if (game) {
        res.json(game.developer); //grab developer data only
      } else {
        res.status(400).send('Developer not found.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// get all games of a certain developer
app.get("/developers/:developerName/games", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Games.find({ "developer.name": req.params.developerName }) //finds the all games that lists the developer
    .then((games) => { 
      if (games.length > 0){ //if there is at least 1 game 
        res.status(200).json(games);
      }
      else{
        res.status(400).send(`This developer doesn't exist in our database`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get all data of a single genre
app.get("/genres/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  let selectedGenre = req.params.genreName;
  await Games.findOne({ "genre.name": selectedGenre }) //finds the first game that lists the genre
    .then((game) => {
      const foundGenre = game.Genre.find(genre => genre.Name === selectedGenre) //find the genre in the array using the name
      if (foundGenre){
        res.status(200).json(foundGenre);
      }
      else{
        res.status(400).send('Genre not found');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get all games of a single genre
app.get("/genres/:genreName/games", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Games.find({ "genre.name": req.params.genreName }) //finds the all games that lists the genre
    .then((games) => { 
      if (games.length > 0){ //if there is at least 1 game 
        res.status(200).json(games);
      }
      else{
        res.status(400).send(`This genre doesn't exist`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// get all games of a certain platform
app.get("/platform/:platformName/games", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Games.find({ platform: req.params.platformName }) //finds the all games that lists the genre
    .then((games) => { 
      if (games.length > 0){ //if there is at least 1 game 
        res.status(200).json(games);
      }
      else{
        res.status(400).send(`This platform doesn't exist`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get all games released on a specific year
app.get("/releaseyear/:releaseYear/games", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Games.find({ releaseYear: req.params.releaseYear }) //finds the all games that have that year
    .then((games) => { 
      if (games.length > 0){ //if there is at least 1 game 
        res.status(200).json(games);
      }
      else{
        res.status(400).send(`No games during this year`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// get all games of a certain series
app.get("/series/:seriesName/games", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Games.find({ series: req.params.seriesName }) //finds the all games that have that year
    .then((games) => { 
      if (games.length > 0){ //if there is at least 1 game 
        res.status(200).json(games);
      }
      else{
        res.status(400).send(`Series not found`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//show all featured games
app.get("/featured", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Games.find({featured : true})
  .then((games)=> {
    res.status(200).json(games);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send("Error: " + err);
  })
});




















//check if I need these two still
//app.use(bodyParser.json()); //already listed up top
//app.use(methodOverride()); //was part of an exercise, might not need anymore?

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

const express = require("express"),
  morgan = require("morgan"),
  fs = require("fs"), // import built in node modules fs and path
  path = require("path"),
  app = express(), //app stores the express module
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  uuid = require("uuid");

app.use(bodyParser.json());



//array of users
let users =[
  {
    id: 1,
    name: "Joe",
    favoriteGames:[],
  },
  {
    id: 2,
    name: "Kim",
    favoriteGames:["Guild Wars 2"],
  },
]


//an array of games
let games = [
  {
    Name: "Tears of the Kingdom",
    Image: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6464/6464080_sd.jpg",
    Developer: {
      Name: "Nintendo",
      Year: 1889,
      Description: "Nintendo Co., Ltd.[b] is a Japanese multinational video game company headquartered in Kyoto. It develops, publishes and releases both video games and video game consoles."
    },
    Year: 2023,
    Platform: ["Nintendo Switch"],
    Genre:{
      Name: "Action Adventure",
      Description: "An action adventure game can be defined as a game with a mix of elements from an action game and an adventure game,[1] especially crucial elements like puzzles.[2] Action-adventures require many of the same physical skills as action games, but also offer a storyline, numerous characters, an inventory system, dialogue, and other features of adventure games."
    }
  },
  {
    Name: "God of War Ragnarok",
    Image: "https://m.media-amazon.com/images/I/817y77i7EFL._AC_UF1000,1000_QL80_.jpg",
    Developer: {
      Name: "Santa Monica Studio",
      Year: 1999,
      Description: "Santa Monica Studio is an American video game developer based in Los Angeles. A first-party studio for Sony Interactive Entertainment, it is best known for developing the God of War series. The studio was founded in 1999 by Allan Becker and was located in Santa Monica, California, until relocating to Playa Vista in 2014."
    },
    Year: 2022,
    Platform: ["Playstation 4","Playstation 5"],
    Genre:{
      Name: "Action Adventure",
      Description: "An action adventure game can be defined as a game with a mix of elements from an action game and an adventure game,[1] especially crucial elements like puzzles.[2] Action-adventures require many of the same physical skills as action games, but also offer a storyline, numerous characters, an inventory system, dialogue, and other features of adventure games."
    },
    // {
    //   Name: "Hack and slash",
    //   Description: "Hack and slash, also known as hack and slay (H&S or HnS) or slash 'em up,[1][2] refers to a type of gameplay that emphasizes combat with melee-based weapons (such as swords or blades). They may also feature projectile-based weapons as well (such as guns) as secondary weapons. It is a sub-genre of beat 'em up games, which focuses on melee combat, usually with swords. Hack-and-slash action games are sometimes known as character action games."
    // }
  },
  {
    Name: "The Last of Us",
    Image: "https://m.media-amazon.com/images/I/A1dXfW1yPNL._AC_UF1000,1000_QL80_.jpg",
    Developer: {
      Name: "Naughty Dog",
      Year: 1884,
      Description: `Naughty Dog, LLC (formerly JAM Software, Inc.[2][3]) is an American first-party video game developer based in Santa Monica, California.[4] Founded by Andy Gavin and Jason Rubin in 1984,[2] the studio was acquired by Sony Computer Entertainment in 2001.`
    },
    Year: 2013,
    Platform: ["Playstation 3","Playstation 4"],
    Genre:{
      Name: "Action Adventure",
      Description: `An action adventure game can be defined as a game with a mix of elements from an action game and an adventure game,[1] especially crucial elements like puzzles.[2] Action-adventures require many of the same physical skills as action games, but also offer a storyline, numerous characters, an inventory system, dialogue, and other features of adventure games.`
    }
  },
  {
    Name: "Guild Wars 2",
    Image: "https://upload.wikimedia.org/wikipedia/en/9/96/Gw2-boxfront.png",
    Developer: {
      Name: "ArenaNet",
      Year: 2000,
      Description: `ArenaNet, LLC is an American video game developer and subsidiary of NCsoft, founded in 2000 by Mike O'Brien, Patrick Wyatt and Jeff Strain and located in Bellevue, Washington. They are most notable as developers of the online role-playing game series Guild Wars.`
    },
    Year: 2012,
    Platform: ["PC"],
    Genre:{
      Name: "MMORPG",
      Description: `A massively multiplayer online role-playing game (MMORPG) is a video game that combines aspects of a role-playing video game and a massively multiplayer online game.

      As in role-playing games (RPGs), the player assumes the role of a character (often in a fantasy world or science-fiction world) and takes control over many of that character's actions. MMORPGs are distinguished from single-player or small multi-player online RPGs by the number of players able to interact together, and by the game's persistent world (usually hosted by the game's publisher), which continues to exist and evolve while the player is offline and away from the game.`
    }
  },
  {
    Name: "Dragon Quest XI",
    Image: "https://m.media-amazon.com/images/I/910nHWHIxpL._AC_UF1000,1000_QL80_.jpg",
    Developer: {
      Name: "Square Enix",
      Year: 2003,
      Description: `Square Enix Holdings Co., Ltd.[b] is a Japanese multinational holding company, video game production enterprise and entertainment conglomerate. It releases role-playing game franchises, such as Final Fantasy, Dragon Quest, and Kingdom Hearts, among numerous others. Outside of video game publishing and development, it is also in the business of merchandise, arcade facilities, and manga publication under its Gangan Comics brand.`
    },
    Year: 2017,
    Platform: ["Nintendo 3DS","Playstation 4","Nintendo Switch","PC","Xbox One","Stadia"],
    Genre:{
      Name: "Role-playing",
      Description: `A role-playing video game, commonly referred to as a role-playing game (RPG) or computer role-playing game (CRPG), is a video game genre where the player controls the actions of a character (or several party members) immersed in some well-defined world, usually involving some form of character development by way of recording statistics.`
    }
  },
];








//logger for terminal only, not to write in log.txt
app.use(morgan("common"));





// CRUD FOR USERS ARRAY
//=========================================
// CREATE
//push new user onto array
app.post("/users",(req, res) =>{
    const newUser = req.body;

    if (newUser.name){  //if the name is not empty
        newUser.id = uuid.v4(); //creates a unique id number using module
        users.push(newUser);
        res.status(201).json(newUser); //status means successful creation, returns new user
    }
    else{ //if name is empty
      res.status(400).send("users need names");
    }
});

// CREATE
// push a new game onto the favorite games array
app.post("/users/:id/:gameName",(req, res) =>{
  const { id, gameName } = req.params;

  let user = users.find(user => user.id == id)  //2 equal signs instead of 3 because these are not strings

  if (user){  //if the name is not empty
    user.favoriteGames.push(gameName);
    res.status(200).send(`${gameName} has been added to ${id}'s array`);
  }
  else{ //if name is empty
    res.status(400).send("user not found");
  }
});

// READ
// To get the users
app.get("/users", (req, res) => {
  res.status(200).json(users);
  //res.send("Successful GET request for all games");
});


// UPDATE
// update user name using ID
app.put("/users/:id",(req, res) =>{
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id)  //2 equal signs instead of 3 because these are not strings

  if (user){  //if the name is not empty
    user.name = updatedUser.name;
    res.status(200).json(user);
  }
  else{ //if name is empty
    res.status(400).send("user not found");
  }
});

// DELETE
// remove game from the array
app.delete("/users/:id/:gameName",(req, res) =>{
  const { id, gameName } = req.params;

  let user = users.find(user => user.id == id)  //2 equal signs instead of 3 because these are not strings

  if (user){  //if the name is not empty
    user.favoriteGames = user.favoriteGames.filter(name => name !== gameName);
    res.status(200).send(`${gameName} has been removed from ${id}'s array`);
  }
  else{ //if name is empty
    res.status(400).send("user not found");
  }
});

// DELETE
// remove user from array
app.delete("/users/:id",(req, res) =>{
  const { id } = req.params;

  let user = users.find(user => user.id == id)  //2 equal signs instead of 3 because these are not strings

  if (user){  //if the name is not empty
    users = users.filter(user => user.id != id);
    res.status(200).send(`User ${id} has been deleted`);
    //res.json(users);
  }
  else{ //if name is empty
    res.status(400).send("user not found");
  }
});






// CRUD FOR GAMES ARRAY
//=========================================
// GET/READ requests
app.get("/", (req, res) => {
  res.send("This is a test");
});

//Replaced above with static, which gets everything in the public folder
app.use(express.static("public"));

app.get("/games", (req, res) => {
  res.status(200).json(games);
  //res.send("Successful GET request for all games");
});

app.get("/games/:name", (req, res) => {
  const { name } = req.params;
  const game = games.find(game => game.Name === name);

  if (game) {
    res.status(200).json(game);
    //res.send("Successful GET request for data of the game");
  } else {
    res.status(400).send("game doesnt exist");
  }
});

app.get("/games/developers/:developerName", (req, res) => {
  const { developerName } = req.params;
  const dev = games.find(game => game.Developer.Name === developerName).Developer;

  if (dev) {
    res.status(200).json(dev);
    //res.send("Successful GET request for the developer of the game");
  } else {
    res.status(400).send("developer doesnt exist");
  }
});

app.get("/games/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = games.find(game => game.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
    //res.send("Successful GET request for data of the game");
  } else {
    res.status(400).send("genre doesnt exist");
  }
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

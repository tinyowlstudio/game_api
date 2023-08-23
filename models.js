const mongoose = require("mongoose");
//encripting passwords
const bcrypt = require('bcrypt');

let gameSchema = mongoose.Schema({
    title: {type: String, required: true},
    image: String,
    description: {type: String, required: true},
    releaseYear: Number,
    platform: [String],
    developer: {
        name: String,
        foundedYear: Number,
        description: String
    },
    genre:[{
        name: String,
        description: String
    }],
    series: String,
    featured: Boolean
});

let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: Date, 
    favoriteGames: [{type: mongoose.Schema.Types.ObjectId, ref: "Game"}]
});

//encrypt password
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
//validate password using encryption
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

let Game = mongoose.model("Game", gameSchema);
let User = mongoose.model("User", userSchema);

module.exports.Game = Game;
module.exports.User = User;
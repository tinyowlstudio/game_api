const mongoose = require("mongoose");
//encripting passwords
const bcrypt = require('bcrypt');

let gameSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Image: String,
    Description: {type: String, required: true},
    ReleaseYear: Number,
    Platform: [String],
    Developer: {
        Name: String,
        FoundedYear: Number,
        Description: String
    },
    Genre:[{
        Name: String,
        Description: String
    }],
    Series: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date, 
    FavoriteGames: [{type: mongoose.Schema.Types.ObjectId, ref: "Game"}]
});

//encrypt password
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
//validate password using encryption
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };

let Game = mongoose.model("Game", gameSchema);
let User = mongoose.model("User", userSchema);

module.exports.Game = Game;
module.exports.User = User;
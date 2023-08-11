const mongoose = require("mongoose");

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

let Game = mongoose.model("Game", gameSchema);
let User = mongoose.model("User", userSchema);

module.exports.Game = Game;
module.exports.User = User;
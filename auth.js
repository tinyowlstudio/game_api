const jwtSecret = "your_jwt_secret"; //Needs to be the same key used in JWTStrategy

const jwt = require("jsonwebtoken"),
    passport = require("passport");

require("./passport"); //local passport.js file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.username, //username to be encoded with JWT
        expiresIn: "7d", //token expires in 7 days
        algorithm: "HS256" //algorithm used so "sign"/encode values of JWT
    });
}

//POST Login
module.exports = (router) => {
    app.options("/login", cors());
    router.post("/login",(req,res) => {
        passport.authenticate("local", {session: false}, (error, user, info) => {
            if (error || !user){
                return res.status(400).json({
                    message: "Something is not right",
                    user: user
                });
            }
            req.login(user, {session: false}, (error) =>{
                if (error){
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON()); //if theres no error, assign token
                return res.json({user, token}); //returns the token
            });
        }) (req, res);
    });
}
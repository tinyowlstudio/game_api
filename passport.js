const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy, //defines basic HTTP authentication for login requests
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy( 
    { //login
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => { 
      console.log(`${username} ${password}`);
      await Users.findOne({ Username: username }) //checks database for username
      .then((user) => {
        if (!user) { //if user doesnt exist
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }
        if (!user.validatePassword(password)) {//checks for password match
          console.log('incorrect password');
          return callback(null, false, { message: 'Incorrect password.' });
        }
        console.log('finished'); //if everything is fine
        return callback(null, user);
      })
      .catch((error) => {
        if (error) {
          console.log(error);
          return callback(error);
        }
      })
    }
  )
);


passport.use(new JWTStrategy({  //new function to allow authentication on JWT submitted
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), //extracts the JWT code from the header
  secretOrKey: 'your_jwt_secret' //this key verifies the signature of JWT, in otherwords makes sure the user is actually said user
}, async (jwtPayload, callback) => {
  return await Users.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user);
    })
    .catch((error) => {
      return callback(error)
    });
}));
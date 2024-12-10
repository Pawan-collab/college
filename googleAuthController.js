const { LogInModel } = require("../models/logInModel");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


passport.serializeUser((user, done) => {
  done(null, user.id);  
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await LogInModel.findById(id);  
    done(null, user); 
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALL_BACK_URL || "/google/auth",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await LogInModel.findOne({ email: profile.emails[0].value }); 
        if (existingUser) {
          return done(null, existingUser);
        } else {
          const newUser = new LogInModel({
            name: profile.displayName,
            email: profile.emails[0].value, 
          });
          await newUser.save();
          return done(null, newUser); 
        }
      } catch (error) {
        return done(error, null); 
      }
    }
  )
);


module.exports = {
  passport,
};
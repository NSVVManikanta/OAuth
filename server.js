
const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const axios = require('axios')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.get('/', function(req, res) {
    res.render('auth',{client_id: clientID});
});

var access_token = "";
const clientID = 'f255e899856882a6999c'
const clientSecret = '52876eeb911d5b5e5ef7dbeb317639c597064cba'
// Declare the callback route
app.get('/github/callback', (req, res) => {

  // The req.query object has the query params that were sent to this route.
  const requestToken = req.query.code
  
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
         accept: 'application/json'
    }
  }).then((response) => {
    access_token = response.data.access_token
    res.redirect('/success1');
  })
})

app.get('/success1', function(req, res) {

  axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      Authorization: 'token ' + access_token
    }
  }).then((response) => {
    res.render('success1',{ userData: response.data });
  })
});

//passport code
var userProfile;

app.use(passport.initialize());
app.use(passport.session());


app.get('/success', (req, res) => res.render('success',{'user':userProfile})); /*send(userProfile))*/
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


 
const GOOGLE_CLIENT_ID = '102965133519-gsaiqcrijc0i1hkess6jhv1ffup0s29s.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });

const port = process.env.PORT || 8080;
app.listen(port , () => console.log('App listening on port ' + port));
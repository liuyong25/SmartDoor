/**
 * Module dependencies.
 */
var auth = require('./controllers/auth');
var chat = require('./controllers/chat');
var remote = require('./controllers/remote');

exports = module.exports = function(app) {
  //homepage
  app.get("/", function(req, res){
    res.render('index');
  });

  //register,login,logout
  app.get("/login", auth.login);
  app.post('/login', auth.login);
  app.get("/logout", auth.logout);

  //remote client
  app.get('/remote',remote.index);

  //chat 
  app.get("/chat", chat.index);
};

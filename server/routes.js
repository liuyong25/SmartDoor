/**
 * Module dependencies.
 */
//var auth = require('./controllers/auth');
//var chat = require('./controllers/chat');

exports = module.exports = function(app) {
  //homepage
  app.get("/(home)?", function(req, res){
    res.render('index');
  });

  //auth
  //app.all('*', auth.auth);
  //app.use(auth.prefilter)

  //register,login,logout
  // app.get("/login", auth.login);
  // app.post('/login', auth.login);
  // app.get("/logout", auth.logout);


  //chat 
  // app.get("/chat", auth.checkLogin, chat.index);
  //app.resource('chat', require('./controllers/chat'));
};

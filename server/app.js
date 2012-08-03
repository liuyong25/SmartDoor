
/**
 * main
 */

//import Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var validator = require('express-validator');
var config = require('./config').config;

//set up express & configure && middleware 
var app = express();

app.set('config',config);
app.set('port', process.env.PORT || config['port'] || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));

//params
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(validator);

//session & cookie
var sessionStore = new express.session.MemoryStore({reapInterval: 60000 * 10});
app.use(express.cookieParser());
app.use(express.session({
  store: sessionStore,
  key: 'sid',
  secret: config['session_secret']
}));

app.use(express.csrf());
app.use(express.static(path.join(__dirname, 'public')));

//provide helper functions/variable to views
app.use(function(req, res, next){
  res.locals.title = config['title']
  res.locals.csrf = req.session ? req.session._csrf : '';
  res.locals.req = req;
  res.locals.session = req.session;
  next();
});
app.use(require('./controllers/auth').checkLogin);
app.use(app.router); //note: this must before errorHandler & after session.


//special env configure. (start node with "set NODE_ENV=production")
switch(app.get('env')){
  case 'production':
    app.use(express.errorHandler());
    break;
  case 'development':
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.locals({
      pretty: true 
    });
    break;
}


//routes & url mapping
require('./routes')(app);

//start http server && socket.io
var server = http.createServer(app);
var io = require('socket.io').listen(server,{
  'log level': 2,
  'browser client minification': true
});
var chatServer = require('./controllers/chat').init(io, app, sessionStore);

server.listen(app.get('port'), function(){
  console.log("%s listening on port %d in %s mode", config.name, app.get('port'), app.settings.env);
  console.log("God bless love....");
  console.log("You can visit your app with http://localhost:%d", app.get('port'));  
});


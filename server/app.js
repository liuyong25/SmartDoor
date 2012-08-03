
/**
 * main
 */

//import Module dependencies.
process.env.NODE_PATH = '../node_modules-'
var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config').config;

//set up express & configure && middleware 
var app = express();

app.set('config',config);
app.set('port', process.env.PORT || config['port'] || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(config['cookie_secret']));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));

//provide helper functions/variable to views
app.locals({
  title: config['title'],
});
app.use(function(req, res, next){
  res.locals.req = function(req,res) {
    return req;
  };
  res.locals.session = function(req,res) {
    return req.session;
  };
  next();
});
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

//start http server
http.createServer(app).listen(app.get('port'), function(){
  console.log("%s listening on port %d in %s mode", config.name, app.get('port'), app.settings.env);
  console.log("God bless love....");
  console.log("You can visit your app with http://localhost:%d", app.get('port'));
});

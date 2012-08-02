
/**
 * main
 */

//import Module dependencies.
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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//special env configure. (start node with "set NODE_ENV=production")
switch(app.get('env')){
  case 'production':
    app.use(express.errorHandler());
    break;
  case 'development':
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.set('view options', { pretty: true });
    break;
}

//provide helper functions/variable to views
app.locals({
  title: config['title']
});

//routes
require('./routes')(app);

//start http server
http.createServer(app).listen(app.get('port'), function(){
  console.log("%s listening on port %d in %s mode",config.name,app.get('port'), app.settings.env);
  console.log("God bless love....");
  console.log("You can visit your app with http://localhost:%d",app.get('port'));
});

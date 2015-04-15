var express       = require('express'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    //cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    jade          = require('jade'),
    session       = require('express-session'),
    db            = require('./db'),
    auth          = require('./auth'),
    Context       = require('./context');

var routes        = require('./routes/index');
routes.users      = require('./routes/users');
routes.groups     = require('./routes/groups');
routes.projects   = require('./routes/projects');
routes.tasks      = require('./routes/tasks');
routes.events     = require('./routes/events');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware stack
//app.use(favicon(__dirname + '/static/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser('SECRET_KEY_GOES_HERE'));
app.use(session({
  secret: 'SECRET_KEY_GOES_HERE',
  saveUninitialized: true,
  resave: false,
}));
auth.init(app);

app.use(function(req, res, next) {
  res.ctx = new Context({page : {}});
  next();
});
// routers
app.use('/', routes);
app.use('/users', routes.users);
//app.use('/login', routes.login);
//app.use('/register', routes.register);
app.use('/groups', routes.groups);
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/projects', routes.projects);
app.use('/tasks', routes.tasks);
app.use('/events', routes.events);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
console.log('Started.');

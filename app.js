var express       = require('express'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    bodyParser    = require('body-parser'),
    jade          = require('jade'),
    session       = require('express-session'),
    db            = require('./db');
    auth          = require('./auth'),
    Context       = require('./context');

db.status.on('ready', function() {
  db.user.bulkCreate([
    {username : "user1", password : "asdf", email : "a@fs.da"},
    {username : "user2", password : "asdf", email : "a@sd.fa"},
    {username : "user3", password : "asdf", email : "s@df.as"},
    {username : "user4", password : "asdf", email : "f@ds.fa"}
  ]);
});

var routes = {
  index    : require('./routes/index'),
  users    : require('./routes/users'),
  groups   : require('./routes/groups'),
  projects : require('./routes/projects'),
  tasks    : require('./routes/tasks'),
  events   : require('./routes/events')
};

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middleware stack
app.use(logger('dev'));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
for (route in routes) {
  var path;
  if (route == 'index') {
    path = '/';
  } else {
    path = '/' + route;
  }
  app.use(path, routes[route]);
}
/*
app.use('/', routes.index);
app.use('/users', routes.users);
app.use('/groups', routes.groups);
app.use('/projects', routes.projects);
app.use('/tasks', routes.tasks);
app.use('/events', routes.events);
*/

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

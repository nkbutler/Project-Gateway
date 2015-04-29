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
  ]).then(function() {
    db.group.bulkCreate([
      {name : "group1", slogan: "group 1 slogan", description : "group 1 description"},
      {name : "group2", slogan: "group 2 slogan", description : "group 2 description"},
      {name : "group3", slogan: "group 3 slogan", description : "group 3 description"},
      {name : "group4", slogan: "group 4 slogan", description : "group 4 description"}
    ]).then(function() {
      db.project.bulkCreate([
        {name : "project1", description : "project 1 description"},
        {name : "project2", description : "project 2 description"},
        {name : "project3", description : "project 3 description"},
        {name : "project4", description : "project 4 description"}
      ]).then(function() {
        db.user.findAll().then(function(users) {
          db.group.findAll().then(function(groups) {
            db.project.findAll().then(function(projects) {
              groups[0].setUsers([users[0], users[1], users[2]]);
              groups[1].setUsers([          users[1], users[2]]);
              groups[2].setUsers([users[0],           users[2], users[3]]);
              groups[3].setUsers([          users[1]]);
              projects[0].setGroups([groups[0], groups[1],            groups[3]]);
              projects[1].setGroups([                      groups[2],          ]);
              projects[2].setGroups([groups[0],            groups[2],          ]);
              projects[3].setGroups([                      groups[2], groups[3]]);
            })
          })
        })
      });
    });
  });


});

var routes = {
  index    : require('./routes/index'),
  user     : require('./routes/users'),
  group    : require('./routes/groups'),
  project  : require('./routes/projects')
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
  req.db = db;
  res.ctx = new Context({
    page : {},
    session : { user : req.user }
  });
  req.page = req.page || {};
  req.page.props = {};
  if (req.user && typeof req.user.id === 'number') { req.page.props.auth = true; }

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
    res.ctx.add({
      message: err.message,
      error: err
    });
    res.render('error', res.ctx);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.ctx.add({
    message: err.message,
    error: {}
  });
  res.render('error', res.ctx);
});


module.exports = app;
console.log('Started.');

var db       = require('./db'),
    passport = require('passport'),
    strategy = require('passport-local').Strategy;

var getUser = function(param) {
  var user = db.user.get(param);
  if (user && user.length == 1) {
    return user[0];
  } else {
    return undefined;
  }
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var user = getUser({id: id});
  if (user) {
    return done(null, user);
  }
});

passport.use(new strategy(
  function(username, password, done) {
    var user = getUser({username: username});
    if (user) {
      if (user.password == password) {
        return done(null, user);
      }
    }
    return done(null, false);
  }
));

module.exports = {
  init : function(router) {
    router.use(passport.initialize());
    router.use(passport.session());
  },
  login : function(req, res, next) {
    return passport.authenticate('local', function(err, user, info) {
      if (user) {
        req.login(user, function(err) {
          if (err) { return next(err); }
          next();
        });
      } else {
        next();
      }
    })(req, res, next);
  },
  logout : function(req, res, next) {
    req.logout();
    next();
  },
  check : function(params) {
    // params = {onSuccess : function, onFailure : function}
    return function(req, res, next) {
      if (req.user || req.isAuthenticated()) {
        if (typeof params.onSuccess == 'function') {
          params.onSuccess(req, res, next)
        }
        else {
          next();
        }
      } else {
        if (typeof params.onFailure == 'function') {
          params.onFailure(req, res, next)
        } else {
          res.redirect('/login');
          res.end();
        }
      }
    }
  },
  checkExists : function(user) {
    var errors = {};
    if (db.user.exists({username : user.username})) {
      errors.username = true;
    }
    if (db.user.exists({email : user.email})) {
      errors.email = true;
    }
    return errors;
  },
  create : function(user) {
    var errors = this.checkExists(user)
    if (!errors.username && !errors.email) {
      db.user.add(user);
    }
  },
  register : passport.authenticate,
  passport : passport
}

var db       = require('./db'),
    passport = require('passport'),
    strategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.user.find(id).then(function(user){done(null, user)}).catch(done);
});

passport.use(new strategy(
  function(login, password, done) {
    db.user.find({ where : { $or : { username : login, email : login } } })
    .then(function(user) {
      if (user && user.password == password) {
        done(null, user);
      } else {
        done();
      }
    })
    .catch(function(ex) {
      done(ex);
    });
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
  register : passport.authenticate,
  passport : passport
}

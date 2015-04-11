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
  db.user.get(id, done);
});

passport.use(new strategy(
  function(login, password, done) {
    var getcb = function(cb) {
      return function(err, user) {
        if (err) {
          done(err);
        } else if (user) {
          if (user.password == password) {
            done(null, user);
          } else {
            done();
          }
        } else {
          cb();
        }
      };
    };

    db.user.get({username: login}, getcb(function(){
      db.user.get({email: login}, getcb(done));
    }));
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
  checkExists : function(user, cb) {
    var errors = {};
    db.user.exists({username : user.username}, function(err, nameExists) {
      if (nameExists) {
        errors.username = true;
      }
      db.user.exists({email : user.email}, function(err, emailExists) {
        if (emailExists) {
          errors.email = true;
        }
        cb(errors);
      });
    });
  },
  create : function(user, cb) {
    db.user.add(user, cb);
  },
  register : passport.authenticate,
  passport : passport
}

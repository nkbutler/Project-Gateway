var express = require('express');
    auth    = require('../auth');
var router = express.Router();
var login = express.Router();

// Render login page on error, redirect to user page when already logged in.
login.route('/')
  .all(
    auth.check({
      // Ask the auth interface to check if the user is already logged in.
      onSuccess : function(req, res, next) {
        res.redirect('/users/' + req.user.username);
      },
      onFailure : function(req, res, next) {
        next();
      }
    }),
    function(req, res, next) {
      // Build the template rendering context
      res.ctx = {
        forms : {
          login : {
            errors : {},
            data : {}
          }
        }
      };
      next();
    }
  )
  .post(
    // If this is a POST request, attempt to authenticate the user.
    auth.login,
    function(req, res, next) {
      if (!req.user) {
        res.ctx.forms.login.errors._form = "Incorrect username or password.";
        res.ctx.forms.login.data.username = req.body.username;
        next();
      } else {
        res.redirect('/users/' + req.user.username);
      }
    }
  )
  .all(function(req, res, next) {
    // Render the login screen's template.
    res.render('login', res.ctx);
  });

router.use('/', login);
router.use('/login', login);
router.route('/logout')
  .get(
    auth.logout,
    function(req, res, next) {
      res.redirect('/');
    });

module.exports = router;

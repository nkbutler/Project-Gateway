var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('username', function(req, res, next, username) {
    db.user.get({username : username}, function(err, user) {
      if (!err && user) {
        req.page = req.page || {};
        req.page.user = user;
        next();
      } else {
        next(new Error("Page not found"));
      }
    });
});

router.route('/:username')
  .all(function(req, res, next) {
    res.ctx.add({
      forms : {
        creategroup : {
          errors : {},
          data : {}
        }
      },
      session : {
        user : req.user
      },
      page : req.page
    });
    next();
  })
  .get(function(req, res, next) {
    res.render('user', res.ctx);
  })
  .post(function(req, res, next) {
    var error = false;
    var group = {
      name : req.body.name,
      descrip : req.body.descrip,
      slogan : req.body.slogan
    };
    // validation goes here
    if (error) {
      next('route');
    } else {
      db.group.add(group, function(err, result) {
        if (!err) {
          res.redirect('/groups/' + result.id + '-' + result.name);
        } {
          next(new Error('Error creating group'));
        }
      });
    }
  });

module.exports = router;

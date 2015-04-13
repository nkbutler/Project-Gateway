var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('id', function(req, res, next, id) {
    db.group.get({id : id}, function(err, group) {
      if (!err && group) {
        req.page = req.page || {};
        req.page.group = group;
        next();
      } else {
        next(new Error("Page not found"));
      }
    });
});

router.route('/:id')
  .all(function(req, res, next) {
    res.ctx.add({
      forms : {
        adduser : {
          errors : {},
          data : {}
        }
      },
      session : {
        // group : req.group
      },
      page : req.page
    });
    next();
  })
  .get(function(req, res, next) {
    res.render('group', res.ctx);
  })
  .post(function(req, res, next) {
    var error = false;
    var user = {
      targetuser : req.body.username
    };

    /*
    if (!req.body.username) {
      res.ctx.forms.adduser.errors.targetuser = ["Invalid Username"];
      res.ctx.forms.adduser.data.targeruser = undefined;
      error = true;
    }
    */

    if (error) {
      next('route');
    } else {
      db.user.get(req.body.username, function(err, result) {
        if (!err) {
          members.group = group.members || [];
            group.members.push(username);
            db.group.save(group);
            res.redirect('/groups/' + req.page.id - '-' + req.page.name);
        } else {
          next(new Error('Error adding user'));
        }
      });
    }
  });

module.exports = router;

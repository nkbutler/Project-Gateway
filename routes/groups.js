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
	},
        createproject : {
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
  /*
  .post(function(req, res, next) {
    var error = false;
    var user = {
      targetuser : req.body.username
    };

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
  })
  */
  .post(function(req, res, next) {
    var error = false;
    var project = {
      pname : req.body.pname,
      descrip : req.body.descrip
    };
    // validation goes here
    if (error) {
      next('route');
    } else {
      db.project.add(project, function(err, result) {
        if (!err) {
          res.redirect('/projects/' + result.id + '-' + result.pname);
        } {
          next(new Error('Error creating project'));
        }
      });
    }
  });

module.exports = router;

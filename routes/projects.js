var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('id', function(req, res, next, id) {
    db.project.get({id : id}, function(err, project) {
      if (!err && project) {
        req.page = req.page || {};
        req.page.project = project;
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
        createtask : {
          errors : {},
	  data : {}
	}
      },
      session : {
      },
      page : req.page
    });
    next();
  })
  .get(function(req, res, next) {
    res.render('project', res.ctx);
  })
  .post(function(req, res, next) {
    var error = false;
    var task = {
      name : req.body.name,
      descrip : req.body.descrip
    };
    // validation goes here
    if (error) {
      next('route');
    } else {
      db.task.add(task, function(err, result) {
        if (!err) {
          res.redirect('/tasks/' + result.id + '-' + result.name);
        } {
          next(new Error('Error creating task'));
        }
      });
    }
  });

module.exports = router;

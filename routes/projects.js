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
        createproject : {
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
    var project = {
      pname : req.body.pname
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

var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('id', db.param(db.event, 'id'));

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
    res.render('event', res.ctx);
  })
  .post(function(req, res, next) {
    var error = false;
    var task = {
      name : req.body.name
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

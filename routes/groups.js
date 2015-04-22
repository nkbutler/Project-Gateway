var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('id', db.param(db.group, 'id'));

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
    db.project.create(project)
    .then(function(result) {
      res.redirect('/projects/' + result.id + '-' + result.pname);
    })
    .catch(function(ex){
      console.log(ex);
      if (ex.message === 'Validation error') {
        // validation vails
        for (e in ex.errors) {                        // populate validation errors
          var field = ex.errors[e].path,
           msg = ex.errors[e].message;
           res.ctx.forms.createproject.errors[field] = [msg];
           if (field == 'password') {
             continue;
           } else {
             res.ctx.forms.createproject.data[field]   = req.body[field];
           }
        }
        next('route');  // skip to error renderer
      } else {
        next(ex);       // other error
      }
    });
  });

module.exports = router;

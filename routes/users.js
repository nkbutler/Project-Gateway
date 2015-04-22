var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('username', db.param(db.user, 'username'));

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
    db.group.create(group)
    .then(function(result) { res.redirect('/groups/' + result.id + '-' + result.name); })
    .catch(function(ex){
      console.log(ex);
      if (ex.message === 'Validation error') {
        // validation vails
        for (e in ex.errors) {                        // populate validation errors
          var field = ex.errors[e].path,
           msg = ex.errors[e].message;
           res.ctx.forms.register.errors[field] = [msg];
           if (field == 'password') {
             continue;
           } else {
             res.ctx.forms.register.data[field]   = req.body[field];
           }
        }
        next('route');  // skip to error renderer
      } else {
        next(ex);       // other error
      }
    });

  });

router.route('/')
.all(
  function(req, res, next) {
    res.render('user', res.ctx);
  }
);

module.exports = router;

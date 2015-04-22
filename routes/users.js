var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('username', db.param(db.user, 'username'));

var authCheck = auth.check({
  onSuccess : function(req, res, next) { next(); },
  onFailure : function(req, res, next) { res.redirect('/login'); }
});

var buildContext = function(req, res, next) {
  var session = { user : req.user };
  var page = req.page || session;
  res.ctx.add({
    session : session,
    page    : page
  });
  console.log(res.ctx);
  next();
}

router.route(['/groups', '/:username/groups'])
  .get(
    authCheck,
    buildContext,
    function(req, res, next) {
      res.render('user/groups', res.ctx);
    }
  )
  .post(
    function(req, res, next) {
      var group = {
        name        : req.body.name,
        description : req.body.description,
        slogan      : req.body.slogan
      };
      db.group.create(group)
      .then(function(result) { res.send({ status : 0 }); })
      .catch(db.validationHandler(req, res, next));
    }
  );

router.route(['/projects', '/:username/projects'])
  .get(
    authCheck,
    buildContext,
    function(req, res, next) {
      res.render('user/projects', res.ctx);
    }
  );

router.route('/').get(authCheck);

router.route(['/', '/:username'])
  .get(
    buildContext,
    function(req, res, next) {
      if (req.page && req.user == req.page.user) {
        res.render('user/home', res.ctx);
      } else {
        res.render('user/view', res.ctx);
      }
    }
  )

module.exports = router;

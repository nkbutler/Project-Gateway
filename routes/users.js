var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth'),
    moment  = require('moment');
var router = express.Router();

router.param('username', db.param(db.user, 'username'));

var authCheck = auth.check({
  onSuccess : function(req, res, next) { next(); },
  onFailure : function(req, res, next) { res.redirect('/login'); }
});

var ajaxAuth = auth.check({
  onSuccess : function(req, res, next) { next(); },
  onFailure : function(req, res, next) { res.status(403).send({ status : 'NOT_AUTHORIZED' }); }
});

var authzCheck = function(req, res, next) {
  if (!req.params.username) {
    authCheck(req, res, next);
  } else {
    next();
  }
};

var buildContext = function(req, res, next) {
  var session = { user : req.user };
  var page = req.page || session;
  res.ctx.add({
    session : session,
    page    : page
  });
  console.log(res.ctx);
  next();
};

router.route(['/groups', '/:username/groups'])
  .get(
    authzCheck,
    buildContext,
    function(req, res, next) {
      var user = res.ctx.page.user;
      user.listGroups().then(function(data) {
        var groups = [];
        for (i in data) {
          var row = data[i];
          for (j in row) {
            if (row[j] && row[j].constructor === Date) {
              // format date
              row[j] = moment(row[j]).fromNow();
            }
          }
          groups.push(row);
        }
        console.log(groups);
        res.ctx.add({
          groups : groups
        });
        res.render('user/groups', res.ctx);
      });
    }
  )

router.route(['/projects', '/:username/projects'])
  .get(
    authzCheck,
    buildContext,
    function(req, res, next) {
      res.render('user/projects', res.ctx);
    }
  );

router.route('/groups/add')
  .get(
    authzCheck,
    buildContext,
    function(req, res, next) {
      res.render('user/createGroup', res.ctx);
    }
  )
  .post(
    ajaxAuth,
    function(req, res, next) {
      var group = {
        name        : req.body.creategroup.name,
        slogan      : req.body.creategroup.slogan,
        description : req.body.creategroup.description
      };
      db.group.create(group)
      .then(function(result) {
        req.user.addGroup(result);
        res.send({ status : 0 });
      })
      .catch(db.validationHandler(req, res, next));
    }
  );

router.route('/').get(authzCheck);

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

router.route('/:username/api/groups')
  .get(
    function(req, res, next) {
      req.page.user.listGroups().then(function(obj) {
        res.send(obj);
      });
    }
  );

module.exports = router;

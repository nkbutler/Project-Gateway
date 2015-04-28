var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth'),
    moment  = require('moment');
var router = express.Router();

router.param('id', db.param(db.group, 'id'));

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
  var session = { group : req.group };
  var page = req.page || session;
  res.ctx.add({
    session : session,
    page    : page
  });
  console.log(res.ctx);
  next();
};

router.route(['/:name/groups'])
  .get(
    authzCheck,
    buildContext,
    function(req, res, next) {
      var group = res.ctx.page.group;
      group.listMembers().then(function(data) {
        var users = [];
        for (i in data) {
          var row = data[i];
          for (j in row) {
            if (row[j] && row[j].constructor === Date) {
              // format date
              row[j] = moment(row[j]).fromNow();
            }
          }
          users.push(row);
        }
        console.log(users);
        res.ctx.add({
          users : users
        });
        next('route');
      });
    }
  )
/*
  .post(
    function(req, res, next) {
      if (!req.params.username) {
        ajaxAuth(req, res, next);
      } else {
        next();
      }
    },
    function(req, res, next) {
      if (req.user && req.page.user.id != req.user.id) {
        req.user.diffGroups(req.page.user)
        .then(function(data) {
          var pk = req.body.addgroup.group;
          var group;
          for (i in data) {
            if (data[i].id == pk) {
              group = data[i];
              break;
            }
          }
          if (group) {
            req.page.user.addGroup(group);
            res.send({status : 0});
          } else {
            next('route');
          }
        });
      } else {
        next('route');
      }
    }
  )
*/

router.route('/groups')
.get(function(req, res, next) {
  next('route');
});

/*
router.route('/groups')
.get(function(req, res, next) {
  if (req.user && req.page.user.id != req.user.id) {
    req.user.diffGroups(req.page.user)
    .then(function(data) {
      res.ctx.add({
        addgroups : data
      });
      next('route');
    });
  } else {
    next('route');
  }
});
*/

router.route(['/groups'])
.get(function(req, res, next) {
  res.render('group/groups', res.ctx);
});

router.route(['/projects', '/:name/projects'])
  .get(
    authzCheck,
    buildContext,
    function(req, res, next) {
      res.render('group/projects', res.ctx);
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
        name        : req.body.creategroup.name || '',
        slogan      : req.body.creategroup.slogan || '',
        description : req.body.creategroup.description || ''
      };
      group.name = group.name.trim();
      db.group.create(group)
      .then(function(result) {
        req.user.addGroup(result);
        res.send({ status : 0 });
      })
      .catch(db.validationHandler(req, res, next));
    }
  );

router.route('/projects/add')
  .get(
    authzCheck,
    buildContext, 
    function(req, res, next) {
      res.render('group/createProject', res.ctx);
    }
  )
  .post(
    ajaxAuth,
    function(req, res, next) {
      var project = {
        name        : req.body.createproject.name || '',
        description : req.body.creategroup.description || ''
      };
      project.name = project.name.trim();
      db.project.create(project)
      .then(function(result) {   
        req.group.addProject(result);
        res.send({ status : 0 });
      })
      .catch(db.validationHandler(req, res, next));
    }
  );

router.route('/').get(authzCheck);

// NEEDS LOGIC HERE TO GIVE DIFFERENT VIEW IF USER IS NOT A MEMBER OF THE GROUP. MAYBE ONLY SEE THE ABOUT PAGE NOT MEMBERS OR PROJECTS.

router.route(['/:id'])
  .get(
    buildContext,
    function(req, res, next) {
      if (req.page && req.user == req.page.user) {
        res.render('group/home', res.ctx);
      } else {
        res.render('group/home', res.ctx);
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

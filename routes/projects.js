var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth'),
    moment  = require('moment');
var router = express.Router();

router.param('id', db.param(db.project, 'id'));
/* PAGE PROPERTIES:
 * auth           User is logged in
 * prokect_other    Viewing other project's page
 * project_own      Viewing own project page
 */
router.use('/:id?\*', function(req, res, next) {
  // Bind properties for parameter routes.
  console.log('bind param props');
  if (!req.page.project) {
    res.sendStatus(404);
    return;
  }

  req.page.project.getGroups().then(function(members) {

    if (req.page.props.auth) {
      req.page.props.project_other = true;
      req.page.props.project_own = false;
      for (var i in members) {
        if (members[i].id === req.user.id) {
          req.page.props.project_own = true;
          req.page.props.project_other = false;
          break;
        }
      }
    }

    res.ctx.add({
      page : {
        group   : req.group,
        project : req.page.project,
        members : members,
        props   : req.page.props
      }
    });
    next('route');
  });
/*
  req.page.group.getTasks().then(function(projecttask) {
    if (req.page.props.auth) {
      req.page.props.group_other = true;
      req.page.props.group_own = false;
      for (var i in projecttask) {
        if (projecttask[i].id === req.task.id) {
          req.page.props.group_own = true;
          req.page.props.group_other = false;
          break;
        }
      }
    }
    res.ctx.add({
      page : {
        task    : req.task,
        project : req.page.project,
        projecttask : projecttask,
        props   : req.page.props
      }
    });
    next('route');
  });
*/
});

router.use('/:id/', require('./project/home'));
router.use('/:id/members', require('./project/members'));
router.use('/:id/tasks', require('./project/tasks'));
router.use('/:id/events', require('./project/events'));
router.use('/:id/tasks/add', require('./project/addTask'));
router.use('/:id/events/add', require('./project/addEvent'));

//TODO: Convert the rest of this.
/*
router.route(['/projects', '/:id/projects'])
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

// NEEDS LOGIC HERE TO GIVE DIFFERENT VIEW IF USER IS NOT A MEMBER OF THE GROUP. MAYBE ONLY SEE THE ABOUT PAGE NOT MEMBERS OR PROJECTS.

*/
module.exports = router;

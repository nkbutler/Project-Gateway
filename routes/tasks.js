var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth'),
    moment  = require('moment');
var router = express.Router();

router.param('id', db.param(db.task, 'id'));
/* PAGE PROPERTIES:
 * auth           User is logged in
 * task_other    Viewing other project's page
 * task_own      Viewing own project page
 */
router.use('/:id?\*', function(req, res, next) {
  // Bind properties for parameter routes.
  console.log('bind param props');
  if (!req.page.task) {
    res.sendStatus(404);
    return;
  }
  
  req.page.task.getProjects().then(function(members) {

    if (req.page.props.auth) {
      req.page.props.task_other = true;
      req.page.props.task_own = false;
      for (var i in members) {
        if (members[i].id === req.user.id) {
          req.page.props.task_own = true;
          req.page.props.task_other = false;
          break;
        }
      }
    }
    
    res.ctx.add({
      page : {
        project : req.project,
        task    : req.page.task,
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

router.use('/:id/', require('./task/home'));
// router.use('/:id/members', require('./project/members'));
// router.use('/:id/tasks', require('./project/tasks'));
// router.use('/:id/events', require('./project/events'));
// router.use('/:id/tasks/add', require('./project/addTask'));
// router.use('/:id/events/add', require('./project/addEvent'));

module.exports = router;

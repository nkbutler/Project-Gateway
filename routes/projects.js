var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth'),
    moment  = require('moment');
var router = express.Router();

router.param('id', db.param(db.project, 'id'));
/* PAGE PROPERTIES:
 * auth           User is logged in
 * project_other    Viewing other project's page
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
    var done = function() {
      res.ctx.add({
        page : {
          group   : req.group,
          project : req.page.project,
          members : members,
          props   : req.page.props
        }
      });
      next('route');
    };
    req.page.props.project_other = true;
    req.page.props.project_own = false;
    if (req.page.props.auth) {
      req.user.getGroups().then(function(groups) {
        for (var i in members) {
          for (var j in groups) {
            if (members[i].id === groups[j].id) {
              req.page.props.project_own = true;
              req.page.props.project_other = false;
              done();
              return;
            }
          }
        }
        done();
      });
    } else {
      done();
    }
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

module.exports = router;

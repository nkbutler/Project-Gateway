var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth'),
    moment  = require('moment');
var router = express.Router();

router.param('id', db.param(db.group, 'id'));
/* PAGE PROPERTIES:
 * auth           User is logged in
 * group_other    Viewing other group's page
 * group_own      Viewing own group page
 */
router.use('/:id?\*', function(req, res, next) {
  // Bind properties for parameter routes.
  console.log('bind param props');
  if (!req.page.group) {
    res.sendStatus(404);
    return;
  }
  req.page.group.getUsers().then(function(members) {
    if (req.page.props.auth) {
      req.page.props.group_other = true;
      req.page.props.group_own = false;
      for (var i in members) {
        if (members[i].id === req.user.id) {
          req.page.props.group_own = true;
          req.page.props.group_other = false;
          break;
        }
      }
    }
    res.ctx.add({
      page : {
        user    : req.user,
        group   : req.page.group,
        members : members,
        props   : req.page.props
      }
    });
    next('route');
  });
});

router.use('/:id/', require('./group/home'));
router.use('/:id/members', require('./group/members'));
router.use('/:id/projects', require('./group/projects'));
router.use('/:id/projects/add', require('./group/addProject'));

module.exports = router;

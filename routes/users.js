var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth'),
    moment  = require('moment');
var router = express.Router();

/* PAGE PROPERTIES:
 * auth           User is logged in
 * user_other     Viewing other user's page
 * user_own       Viewing own user page
 * user_profile   Viewing a private profile page (/user without parameter)
 */
router.use(function(req, res, next) {
  // Bind properties for global routes.
  console.log('bind global props');
  if (req.page.props.auth) {
    req.page.props.user_profile = true;
    req.page.props.user_own = true;
  }
  res.ctx.add({
    page : {
      user  : req.user,
      props : req.page.props
    }
  });
  next('route');
});

router.param('username', db.param(db.user, 'username'));

router.use('/:username', function(req, res, next) {
  // Bind properties for parameter routes.
  console.log('bind param props');
  res.ctx.page.user = req.page.user;
  if (req.page.props.auth) {
    req.page.props.user_profile = false;
    if (req.page.user.id != req.user.id) {
      req.page.props.user_other = true;
      req.page.props.user_own = false;
    } else {
      req.page.props.user_own = true;
      req.page.props.user_other = false;
    }
  }
  next('route');
});

// Authorization guards for profile routes.
var authCheck = express.Router();
authCheck.route('')
  .all(function(req, res, next) {
    console.log('checkauth');
    if (req.page.props.auth) {
      next('route');
    } else {
      next();
    }
  })
  .get(function(req, res, next) {
    res.redirect('/login');
  })
  .post(function(req, res, next) {
    res.status(403).send({ status : 'NOT_AUTHORIZED' });
  });

router.use(['/groups', '/projects', '/'], authCheck);

router.use(['/groups', '/:username/groups'], require('./user/groups'));
router.use('/groups/add', authCheck, require('./user/profile/addGroup'));

router.use(['/projects', '/:username/projects'], require('./user/projects'));

router.use(['/:username', '/'], require('./user/home'));
router.use('/api', require('./user/api'));

module.exports = router;

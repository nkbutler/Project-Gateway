var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('username', function(req, res, next, username) {
    result = db.user.get({username : username}) || {};
    req.page = req.page || {};
    if (!result.err && result.length == 1) {
        req.page.user = result[0];
        next();
    } else {
        next(new Error("Page not found"));
    }
});

router.route('/:username')
  .all(function(req, res, next) {
    res.ctx = {
      session : {
        user : req.user
      },
      page : req.page
    };
    next();
  })
  .get(function(req, res, next) {
    res.render('user', res.ctx);
  });

module.exports = router;

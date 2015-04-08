var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('username', function(req, res, next, username) {
    db.user.get({username : username}, function(err, user) {
      if (!err && user) {
        req.page = req.page || {};
        req.page.user = user;
        next();
      } else {
        next(new Error("Page not found"));
      }
    });
});

router.route('/:username')
  .all(function(req, res, next) {
    res.ctx.add({
      session : {
        user : req.user
      },
      page : req.page
    });
    next();
  })
  .get(function(req, res, next) {
    res.render('user', res.ctx);
  });

module.exports = router;

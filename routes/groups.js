var express = require('express'),
    db      = require('../db'),
    auth    = require('../auth');
var router = express.Router();

router.param('id', function(req, res, next, id) {
    db.group.get({id : id}, function(err, group) {
      if (!err && group) {
        req.page = req.page || {};
        req.page.group = group;
        next();
      } else {
        next(new Error("Page not found"));
      }
    });
});

router.route('/:id')
  .all(function(req, res, next) {
    res.ctx.add({
      session : {
        // group : req.group
      },
      page : req.page
    });
    next();
  })
  .get(function(req, res, next) {
    res.render('group', res.ctx);
  });

module.exports = router;

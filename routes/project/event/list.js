var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req, res, next) {
    var project = res.ctx.page.project;
    project.getEvents().then(function(events) {
      console.log(events);
      res.ctx.add({
        events : events
      });
      res.render('project/events', res.ctx);
    });
  });

module.exports = router;

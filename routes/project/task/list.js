var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req, res, next) {
    var project = res.ctx.page.project;
    project.getTasks().then(function(tasks) {
      console.log(tasks);
      res.ctx.add({
        tasks : tasks
      });
      res.render('project/tasks', res.ctx);
    });
  });

module.exports = router;

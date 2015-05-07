var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      var project = res.ctx.page.project;
      project.getTasks().then(function(data) {
        var taskdata = [];
        for (i in data) {
          var row = data[i].toJSON();
          row.joined = row.ProjectTask.joined;
          taskdata.push(row);
        }
        var tasks = project.Model.formatDates(data);
        res.ctx.add({
          tasks : tasks
        });
        next('route');
      });
    }
  )


router.route('/')
.get(function(req, res, next) {
  res.render('project/tasks', res.ctx);
});


module.exports = router;

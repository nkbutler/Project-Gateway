var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req, res, next) {
    var project = res.ctx.page.project;
    project.getGroups().then(function(data) {
      var groupdata = [];
      for (i in data) {
        var row = data[i].toJSON();
        row.joined = row.ProjectGroup.joined;
        groupdata.push(row);
      }
      var groups = project.Model.formatDates(groupdata);
      res.ctx.add({
        groups : groups
      });
      next('route');
    });
  });

router.route('/')
.get(function(req, res, next) {
  res.render('project/members', res.ctx);
});

module.exports = router;

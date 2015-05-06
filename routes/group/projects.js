var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      var group = res.ctx.page.group;
      group.getProjects().then(function(data) {
        var projectdata = [];
        for (i in data) {
          var row = data[i].toJSON();
          row.joined = row.ProjectGroup.joined;
          userdata.push(row);
        }
        var projects = group.Model.formatDates(data);
        res.ctx.add({
          projects : projects
        });
        next('route');
      });
    }
  )


router.route('/')
.get(function(req, res, next) {
  res.render('group/projects', res.ctx);
});


module.exports = router;

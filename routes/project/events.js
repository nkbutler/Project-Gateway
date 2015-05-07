var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      var project = res.ctx.page.project;
      project.getEvents().then(function(data) {
        var eventdata = [];
        for (i in data) {
          var row = data[i].toJSON();
          row.joined = row.ProjectEvent.joined;
          eventdata.push(row);
        }
        var events = project.Model.formatDates(data);
        res.ctx.add({
          events : events
        });
        next('route');
      });
    }
  )


router.route('/')
.get(function(req, res, next) {
  res.render('project/events', res.ctx);
});


module.exports = router;

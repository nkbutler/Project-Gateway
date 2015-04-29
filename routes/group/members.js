var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      var group = res.ctx.page.group;
      group.getUsers().then(function(data) {
        var userdata = [];
        for (i in data) {
          var row = data[i].toJSON();
          row.joined = row.Members.joined;
          userdata.push(row);
        }
        var users = group.Model.formatDates(userdata);
        res.ctx.add({
          users : users
        });
        next('route');
      });
    }
  )


router.route('/')
.get(function(req, res, next) {
  res.render('group/members', res.ctx);
});


module.exports = router;

var express = require('express');
var router = express.Router();

router.route('/')
  .get( // group list
    function(req, res, next) {
      var user = res.ctx.page.user;
      user.listProjects().then(function(data) {
        res.ctx.add({
          projects : req.db.project.formatDates(data)
        });
        next();
      });
    },
    function(req, res, next) {
      // build list of different projects for add user function
      if (req.page.props.user_other) {
        req.user.diffGroups(req.page.user)
        .then(function(data) {
          res.ctx.add({
            addgroups : data
          });
          next('route');
        });
      } else {
        next('route');
      }
    }
  )
  .post( // add user handler
    function(req, res, next) {
      if (!req.page.props.user_other) {
        next('route'); // 404
      } else {
        req.user.diffGroups(req.page.user)
        .then(function(data) {
          var pk = req.body.addgroup.group;
          var group;
          for (i in data) {
            if (data[i].id == pk) {
              group = data[i];
              break;
            }
          }
          if (group) {
            req.page.user.addGroup(group);
            res.send({status : 0});
          } else {
            next('route'); // 404
          }
        });
      }
    }
  );

router.route('/')
.get(function(req, res, next) {
  res.render('user/projects', res.ctx);
});

module.exports = router;

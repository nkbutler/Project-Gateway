var express = require('express');
var router = express.Router();

router.route('/')
  .get( // group list
    function(req, res, next) {
      var user = res.ctx.page.user;
      user.listProjects().then(function(data) {
        res.ctx.add({
          projects : data
        });
        res.render('user/projects', res.ctx);
      });
    }
  );

module.exports = router;

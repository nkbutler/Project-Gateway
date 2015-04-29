var express = require('express');
var router = express.Router();

router.route('/groups/')
  .get(
    function(req, res, next) {
      req.page.user.listGroups().then(function(obj) {
        res.send(obj);
      });
    }
  );

module.exports = router;

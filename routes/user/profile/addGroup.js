var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      res.render('user/createGroup', res.ctx);
    }
  )
  .post(
    function(req, res, next) {
      var group = {
        name        : req.body.creategroup.name || '',
        slogan      : req.body.creategroup.slogan || '',
        description : req.body.creategroup.description || ''
      };
      group.name = group.name.trim();
      db.group.create(group)
      .then(function(result) {
        req.user.addGroup(result);
        res.send({ status : 0 });
      })
      .catch(db.validationHandler(req, res, next));
    }
  );

module.exports = router;

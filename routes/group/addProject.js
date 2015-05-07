var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      res.render('group/createProject', res.ctx);
    }
  )
  .post(
    function(req, res, next) {
      var project = {
        name        : req.body.createproject.name || '',
        description : req.body.createproject.description || ''
      };
      project.name = project.name.trim();
      db.project.create(project)
      .then(function(result) {
        req.page.group.addProject(result);
        res.send({ status : 0 });
      })
      .catch(db.validationHandler(req, res, next));
    }
  );

module.exports = router;

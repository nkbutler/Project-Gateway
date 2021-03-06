var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      res.render('project/createTask', res.ctx);
    }
  )
  .post(
    function(req, res, next) {
      var task = {
        name        : req.body.createtask.name || '',
        due         : req.body.createtask.due || '',
        description : req.body.createtask.description || ''
      };
      task.name = task.name.trim();
      db.task.create(task)
      .then(function(result) {
        req.page.project.addTask(result);
        res.send({ status : 0 });
      })
      .catch(db.validationHandler(req, res, next));
    }
  );

module.exports = router;

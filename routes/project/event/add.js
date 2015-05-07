var express = require('express');
var router = express.Router();

router.route('/')
  .get(
    function(req, res, next) {
      res.render('project/createEvent', res.ctx);
    }
  )
  .post(
    function(req, res, next) {
      var event = {
        name        : req.body.createevent.name || '',
        description : req.body.createevent.description || '',
        date        : req.body.createevent.date || '',
        location    : req.body.createevent.location || ''
      };
      event.name = event.name.trim();
      db.event.create(event)
      .then(function(result) {
        req.page.project.addEvent(result);
        res.send({ status : 0 });
      })
      .catch(db.validationHandler(req, res, next));
    }
  );

module.exports = router;

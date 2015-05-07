var express = require('express'),
    db      = require('../../db');
var router = express.Router();

router.param('id', db.param(db.task, 'id'));
router.use('/:id-\*', function(req, res, next) {
  // Bind properties for parameter routes.
  console.log('bind task param props');
  if (!req.page.task) {
    res.sendStatus(404);
    return;
  }
  res.ctx.add({
    page : {
      task : req.page.task
    }
  });
  next('route');
});


router.use('/new', require('./task/add'));
router.use('/:id-\*', require('./task/view'));
router.use('/', require('./task/list'));

module.exports = router;

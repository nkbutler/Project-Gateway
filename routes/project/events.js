var express = require('express'),
    db      = require('../../db');
var router = express.Router();

router.param('id', db.param(db.event, 'id'));
router.use('/:id-\*', function(req, res, next) {
  // Bind properties for parameter routes.
  console.log('bind event param props');
  if (!req.page.event) {
    res.sendStatus(404);
    return;
  }
  res.ctx.add({
    page : {
      event : req.page.event
    }
  });
  next('route');
});

router.use('/new', require('./event/add'));
router.use('/:id-\*', require('./event/view'));
router.use('/', require('./event/list'));

module.exports = router;

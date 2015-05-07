var express = require('express');
var router = express.Router();

router.use('/', require('./members/list'));

module.exports = router;

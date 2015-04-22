var engine       = require('./backends/sequelize'),
    EventEmitter = require('events').EventEmitter,
    models       = require('./dbmodels'),
    conn_params  = require('./dbconfig');

var db = function(conn_params, models) {
  engine.call(this, conn_params, models, new EventEmitter());
}

db.prototype = Object.create(engine.prototype);
db.prototype.constructor = db;
db.prototype.param = function(model, paramName) {
  return function(req, res, next, param) {
    var where = { where : {} };
    where.where[paramName] = param;
    model.find(where)
    .then(function(data) {
      if (data) {
        req.page = req.page || {};
        req.page[model.name.toLowerCase()] = data;
        next();
      } else {
        next(new Error("Page not found"));
      }
    })
    .error(function(ex) {
      next(ex);
    });
  };
};

module.exports = new db(conn_params, models);

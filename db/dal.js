var engine       = require('./backends/sequelize'),
    EventEmitter = require('events').EventEmitter,
    models       = require('./dbmodels'),
    conn_params  = require('./dbconfig');

var db = function(conn_params, models) {
  engine.call(this, conn_params, models, new EventEmitter());
}

db.prototype = Object.create(engine.prototype);
db.prototype.constructor = db;
db.prototype.param = function(model, paramName, onSuccess, onError) {
  return function(req, res, next, param) {
    console.log('param', param)
    var where = { where : {} };
    where.where[paramName] = param;
    model.find(where)
    .then(function(data) {
      if (data) {
        req.page = req.page || {};
        req.page[model.name.toLowerCase()] = data;
        next();
      } else {
        next('route');
      }
    })
    .catch(function(ex) { next(ex); });
  };
};
db.prototype.validationHandler = function(req, res, next, params) {
  params = params || {};
  var fieldmap = params.fieldmap || {};
  var onError = params.onError || function(ex) {
    res.send({
      status : 1,
      errors: res.errors
    });
  };
  var onSuccess = params.onSuccess || function(ex) { next(ex) };
  return function(ex) {
    if (ex) {
      if (ex.name.indexOf('ValidationError') != -1 || ex.name.indexOf('ConstraintError') != -1) {
        res.errors = res.errors || {};
        for (e in ex.errors) {
          var field = ex.errors[e].path,
          msg = ex.errors[e].message;
          field = fieldmap[field] || field;
          if (field.constructor === Array) {
            // Set error state for all subfields.
            for (var i in field) { res.errors[field[i]] = true; }
            res.errors[field[0]] = msg;
          } else {
            res.errors[field] = msg;
          }
        }
      }
      onError(ex);
    } else {
      onSuccess(ex);
    }
  };
};

module.exports = new db(conn_params, models);

var Sequelize = require('sequelize');

module.exports = function(dbparams, models, statusEmitter) {
  this.status = statusEmitter;
  this._conn = new Sequelize(null, null, null, {
    logging : console.log,
    dialect: 'mysql',
    dialectOptions : dbparams
  });
  this._models = {};
  for (var name in models) {
    var inst, model = models[name];
    model.options = model.options || {};
    model.options.tableName = model.options.tableName || name;
    for (var col in model.validations) {
      model.schema[col].validate = model.validations[col];
    }
    inst = this._conn.define(name, model.schema, model.options);
    this._models[name] = this[name.toLowerCase()] = inst;
    for (var mname in model.methods) {
      if (inst[mname] !== undefined) {
        throw new Error(mname + ' is already defined on ' + name);
      } else {
        inst[mname] = model.methods[mname];
      }
    }
  }
  for (var name in models) {
    for (var i in models[name].relations) {
      var rel = models[name].relations[i];
      if (typeof models[name].relations[i] == 'function') {
        rel.call(this._models);
      }
    }
  }
  var db = this._conn;
  db.drop().then(function() {
    db.sync().then(function() {
      statusEmitter.emit('ready');
    });
  });
};

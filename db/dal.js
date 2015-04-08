var orm         = require('orm'),
    Event       = require('events').EventEmitter,
    conn_params = require('./dbconfig');

var models = {
  User : {
    schema : {
      id          : {type: 'serial', key: true},
      username    : {type: 'text', unique: true},
      email       : {type: 'text', unique: true},
      phone       : {type: 'text'},
      password    : {type: 'text'}
    }
  },
  Group : {
    schema : {
      id          : {type: 'serial', key: true},
      name        : {type: 'text'},
      created     : {type: 'date', time: true},
    },
    relations : function(dbModels) {
      dbModels.Group.hasMany('members', dbModels.User, {
        joined          : {type: 'date', time: true},
      }, {
        reverse : 'groups',
        key     : true      // composite primary key from join table's foreign keys
      });
    }
  },
}



var Model = function(dbmodel) {
  this.dbmodel = dbmodel;
};

Model.prototype.get = function(param, cb) {
  if (typeof param != 'object') {
    this.dbmodel.get(param, cb);
  } else {
    this.dbmodel.find(param, function(err, data) {
      if (err) {
        cb(err);
      } else if (data.length > 1) {
        cb(new Error("Duplicate key."));
      } else {
        cb(err, data[0]);
      }
    });
  }
};

Model.prototype.getAll = function(param, cb) {
  this.dbmodel.find(param, cb);
};

Model.prototype.add = function(data, cb) {
  this.dbmodel.create(data, cb);
};

Model.prototype._getInstance = function(data, cb) {
  if (typeof data.isInstance == 'function' && data.isInstance()) {
    cb(false, data);
  } else {
    this.get(data.id, function(err, dbInstance) {
      if (!err && dbInstance) {
        for(name in data) {
          dbInstance[name] = data[name];
        }
      }
      cb(err, dbInstance);
    });
  }
};

Model.prototype.delete = function(data, cb) {
  this._getInstance(data, function(err, dbInstance) {
    if (err) {
      cb(err, undefined)
    } else {
      dbInstance.remove(cb);
    }
  });
};

Model.prototype.save = function(data, cb) {
  this._getInstance(data, function(err, dbInstance) {
    if (err) {
      cb(err, undefined)
    } else {
      dbInstance.save(cb);
    }
  });
};

Model.prototype.exists = function(param, cb) {
  this.dbmodel.exists(param, cb);
};

var orm_db = function(params) {
  var db = this;
  this.status = new Event();
  this._conn = orm.connect(params, function (err, conn) {
    if (!err) {
      db._conn = conn;
      db._models = {};
      for (var name in models) {
        var model = models[name];
        db._models[name] = conn.define(name, model.schema, model.options);
        db[name.toLowerCase()] = new Model(db._models[name]);
      }
      for (var name in models) {
        if (typeof models[name].relations == 'function') {
          models[name].relations(db._models);
        }
      }
      db._conn.drop(function() {
        db._conn.sync(function(){
          db.status.emit('ready');
        });
      });
    } else {
      throw err;
    }
  });
};

var db = new orm_db(conn_params);

module.exports = db;

module.exports = {
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
      slogan      : {type: 'text'},
      descrip     : {type: 'text'},
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
  Project : {
    schema : {
      id          : {type: 'serial', key: true},
      pname       : {type: 'text'},
      descrip     : {type: 'text'},
      created     : {type: 'date', time: true},
    }
  },
  Task : {
    schema : {
      id         : {type: 'serial', key: true},
      name       : {type: 'text'},
      descrip    : {type: 'text'},
      created    : {type: 'date', time: true},
    }
  },
  Event : {
    schema : {
      id         : {type: 'serial', key: true},
      name       : {type: 'text'},
      descrip    : {type: 'text'},
      date       : {type: 'date', time : true},
      location   : {type: 'text'},
      created    : {type: 'date', time: true},
    }
  },
}

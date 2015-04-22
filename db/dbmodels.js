var Sequelize = require('sequelize');

// validation helpers
var validators = {
  unique : function(key, message) {
    message = message || key + ' must be unique.';
    return function(value, next) {
      var filter = {}
      filter[key] = value;
      this.Model.count({where : filter}).then(function(count) {
        console.log(count);
        if (count !== 0) {
          next(new Error(message));
        } else {
          next(count);
        }
      });
    };
  }
};

// model method helpers
var methods = {
  formatResult : function(formatter) {
    return function(next) {
      // return a list of all usernames, firstnames, lastnames
      this.findAll().success(function(data) {
        var result = [];
        for (i in data) {
          var row = data[i];
          result.push(formatter(row));
        }
        next(result);
      });
    }
  },
};

module.exports = {
  User : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      username    : { type : Sequelize.STRING, unique: true, allowNull: false },
      email       : { type : Sequelize.STRING, unique: true, allowNull: false },
      phone       : { type : Sequelize.STRING },
      password    : { type : Sequelize.STRING },
      password2   : { type : Sequelize.VIRTUAL }
    },
    validations : {
      username    : validators.unique('username', 'Username already in use.'),
      email       : validators.unique('email', 'Email address already in use.')
    },
    options : {
      validate : {
        passwordsMatch : function() {
          if (this.password !== this.password2 || !this.password || !this.password2) {
            throw new Error('Passwords must match');
          }
        }
      }
    }
  },
  Group : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name        : { type : Sequelize.STRING },
      slogan      : { type : Sequelize.STRING },
      descrip     : { type : Sequelize.STRING },
      created     : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    },
    relations : function() {
      this.Group.belongsToMany(this.User, { through : this.Members, as : 'members' });
      this.User.belongsToMany(this.Group, { through : this.Members, as : 'groups' });
    }
  },
  Members : {
    schema : {
      joined      : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    },
  },
  Project : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      pname       : { type : Sequelize.STRING },
      descrip     : { type : Sequelize.STRING },
      created     : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    }
  },
  Task : {
    schema : {
      id         : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name       : { type : Sequelize.STRING },
      descrip    : { type : Sequelize.STRING },
      created    : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    }
  },
  Event : {
    schema : {
      id         : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name       : { type : Sequelize.STRING },
      descrip    : { type : Sequelize.STRING },
      date       : {type: 'date', time : true},
      location   : { type : Sequelize.STRING },
      created    : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    }
  },
};

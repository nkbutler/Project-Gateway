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
      this.findAll().then(function(data) {
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
      username    : { unique : validators.unique('username', 'Username already in use.') },
      email       : { unique : validators.unique('email', 'Email address already in use.') }
    },
    options : {
      validate : {
        passwordsMatch : function() {
          if (this.password !== this.password2 || !this.password || !this.password2) {
            throw new Error('Passwords must match');
          }
        }
      },
      instanceMethods : {
        listGroups : function() {
          var query = 'SELECT DISTINCT g.id, g.name, g.slogan, g.description, t.members, m.joined, g.created FROM `Members` m INNER JOIN `Group` g ON m.GroupId = g.id INNER JOIN (SELECT m.GroupId, count(m.UserId) as members FROM `Members` m GROUP BY m.GroupId) t ON t.GroupId = g.id WHERE m.UserId = ' + this.id + ';';
          return this.sequelize.query(query, { type: this.sequelize.QueryTypes.SELECT });
        },
        diffGroups : function(user) {
          var query = 'SELECT g.* FROM `Group` g INNER JOIN Members m ON g.id = m.GroupId WHERE m.UserId = ' + this.id + ' AND m.GroupId NOT IN (SELECT GroupId FROM `Members` WHERE UserId = ' + user.id + ');';
          return this.sequelize.query(query, this.sequelize.models.Group);
        }
      }
    },
  },
  Group : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name        : { type : Sequelize.STRING },
      slogan      : { type : Sequelize.STRING },
      description : { type : Sequelize.STRING },
      created     : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    },
    validations : {
      name        : { notEmpty : { msg : 'Invalid name.' }, is: { msg : 'Invalid name.', args : /^[a-z 0-9\-]+$/i } }
    },
    relations : [function() {
      this.Group.belongsToMany(this.User, { through : this.Members });
      this.User.belongsToMany(this.Group, { through : this.Members });
    }]
  },
  Members : {
    schema : {
      joined      : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    },
  },
  Project : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name        : { type : Sequelize.STRING },
      description : { type : Sequelize.STRING },
      created     : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    },
    relations : [function() {
      this.Group.belongsToMany(this.Project, { through : 'ProjectGroup' });
      this.Project.belongsToMany(this.Group, { through : 'ProjectGroup' });
    }]
  },
  Task : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name        : { type : Sequelize.STRING },
      description : { type : Sequelize.STRING }
    }
  },
  Event : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name        : { type : Sequelize.STRING },
      description : { type : Sequelize.STRING },
      date        : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
      location    : { type : Sequelize.STRING }
    }
  },
};

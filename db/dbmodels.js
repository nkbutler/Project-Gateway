var Sequelize = require('sequelize'),
    moment    = require('moment');

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
  formatDates : function(formatter) {
    formatter = formatter || function(date) { return moment(date).format('MMMM Do YYYY'); };
    return function(data) {
      var result = [];
      for (var i in data) {
        var obj = {};
        if (typeof data[i].toJSON === 'function') {
          row = data[i].toJSON();
        } else {
          row = data[i];
        }
        for (var j in row) {
          if (row[j] && row[j].constructor === Date) {
            obj[j] = formatter(row[j]);
          } else {
            obj[j] = row[j];
          }
        }
        result.push(obj);
      }
      return result;
    };
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
      password2   : { type : Sequelize.VIRTUAL },
      industry    : { type : Sequelize.STRING },
      bio         : { type : Sequelize.STRING },
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
        },
        listProjects : function() {
          var query = 'SELECT DISTINCT p.* FROM Project p INNER JOIN ProjectGroup pg ON pg.ProjectId = p.id INNER JOIN `Group` g ON pg.GroupId = g.id INNER JOIN Members m ON m.GroupId = g.id INNER JOIN User u ON u.id = m.UserId WHERE u.id = ' + this.id + ';'
          return this.sequelize.query(query, this.sequelize.models.Project);
        }
      },
    }
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
    }],
    options : {
      classMethods : {
        formatDates : methods.formatDates(function(date){ return moment(date).fromNow() }),
      },
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
      name        : { type : Sequelize.STRING },
      description : { type : Sequelize.STRING },
      created     : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    },
    relations : [function() {
      this.Group.belongsToMany(this.Project, { through : this.ProjectGroup });
      this.Project.belongsToMany(this.Group, { through : this.ProjectGroup });
      this.Project.hasMany(this.Event);
      this.Project.hasMany(this.Task);
    }],
    options : {
      classMethods : {
        formatDates : methods.formatDates(function(date){ return moment(date).fromNow() }),
      },
    }
  },
  ProjectGroup : {
    schema : {
      joined      : { type : Sequelize.DATE, defaultValue : Sequelize.NOW },
    },
  },
  Task : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name        : { type : Sequelize.STRING },
      due         : { type : Sequelize.DATE,
        set       : function(v) { this.setDataValue('due', new Date(v)); },
        get       : function(v) { return moment(this.getDataValue('due')).format('MMMM Do YYYY, h:mm:ss a'); }
      },
      description : { type : Sequelize.STRING }
    },
  },
  Event : {
    schema : {
      id          : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name        : { type : Sequelize.STRING },
      description : { type : Sequelize.STRING },
      date         : { type : Sequelize.DATE,
        set       : function(v) { this.setDataValue('date', new Date(v)); },
        get       : function(v) { return moment(this.getDataValue('date')).format('MMMM Do YYYY, h:mm:ss a'); }
      },
      location    : { type : Sequelize.STRING }
    },
  },
};

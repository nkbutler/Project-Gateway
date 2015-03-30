var mysql = require('mysql');
// Database interface
module.exports = {
  user : {
    _data : [{id : 1, username : "testuser", email : "a@sdf", password : "asdf"}], // Fake database for now. No persistence.
    _lookup : function(key, val) {
      result = []
      for (var i in this._data) {
        var rec = this._data[i];
        if (rec[key] == val) {
          result.push(rec);
        }
      }
      return result;
    },
    get : function(param) {
      if (!param) {
        return this._data;
      } else if (typeof param == "object") {
        if (param["username"]) {
          return this._lookup("username", param["username"]);
        } else if (param["email"]) {
          return this._lookup("email", param["email"]);
        } else if (param["id"]) {
          return this._lookup("id", param["id"]);
        }
      }
    },
    add : function(user) {
      if (!user.id) {
        var max = 0;
        for (var i in this._data) {
          var rec = this._data[i];
          if (rec.id > max) {
            max = rec.id;
          }
        }
        user.id = max + 1;
      }
      console.log(user);
      this._data.push({
        id       : user.id,
        username : user.username,
        password : user.password,
        email    : user.email
      });
    },
    exists: function(param) {
      var result = this.get(param);
      if (result.length == 1) {
        return true;
      } else {
        return false;
      }
    }
  }
};
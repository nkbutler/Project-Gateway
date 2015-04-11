var engine      = require('./backends/orm'),
    models      = require('./dbmodels'),
    conn_params = require('./dbconfig'),
    EventEmitter= require('events').EventEmitter;

var db = new engine(conn_params, models, new EventEmitter());

db.status.on('ready', function() {
  // test data pre-loads
  db.user.add(
    [
      {username : "user1", password : "asdf", email : "a@s.df"},
      {username : "user2", password : "asdf", email : "s@d.fa"},
      {username : "user3", password : "asdf", email : "d@f.as"},
      {username : "user4", password : "asdf", email : "f@a.sd"},
    ],
    function(err, res) { if (err) { throw err; } }
  );
});

module.exports = db;

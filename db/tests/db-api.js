db = require('../dal');

db.status.on('ready', function() {
  db.user.add({id: 1, username : "testuser", password : "user", email : "a@s.df"}, function(err, res) {
    if (err) { throw err; }
    db.user.get(1, function(err, userbyid) {
      if (err) { throw err; }
      db.user.get({username : "testuser"}, function(err, userbyname) {
        if (err) { throw err; }
        if (userbyid.username == userbyname.username && userbyname.username == "testuser") {
          console.log("add/get test pass");
          db.status.emit('gettest');
        } else {
          console.log('by-id:', userbyid.username, 'by-name:', userbyname.username);
          throw new Error("add/get test failed");
        }
      })
    });
  });
});

db.status.on('gettest', function() {
  var failTest = function() {
    throw new Error("multi-add failed");
  };
  db.user.add([
  {id: 2, username : "testuser1", password : "user", email : "a1@s.df"},
  {       username : "testuser2", password : "user", email : "a2@s.df"},
  {       username : "testuser3", password : "user", email : "a3@s.df"},
  {       username : "testuser4", password : "user", email : "a4@s.df"},
  ], function(err, res) {
    if (err) { throw err; }
    var src_ids = [2, 3, 4, 5];
    var got_ids = [];
    db.user.getAll({'id' : src_ids}, function(err, res) {
      if (err) { throw err; }
      for (var i in res) {
        got_ids.push(res[i].id);
      }
      if (src_ids.length != got_ids.length) {
        console.log('length mismatch');
        failTest();
      }
      while (src_ids.length > 0) {
        var id = src_ids.shift();
        var found = got_ids.indexOf(id);
        if (found == -1) {
          console.log('key not found');
          failTest();
        }
      }
      console.log('multi-add test pass');
      db.status.emit('multiaddtest');
    });
  });
});


db.status.on('multiaddtest', function() {
  var edittest1 = {
    id          : 1,
    username    : "testuser",
    email       : "fdsa",
    phone       : 7654321,
    password    : "password"
  };
  db.user.save(edittest1, function(err, res) {
    //console.log('edit test 2');
    if (err) { throw err; }
    db.user.get(edittest1.id, function(err, res) {
      if (err) { throw err; }
      if (res.phone != edittest1.phone) {
        console.log(res.phone, edittest1.phone);
        throw new Error("edit test 1 failed");
      } else {
        console.log('edit test 1 pass');
        db.status.emit('edittest1');
      }
    });
  });
});

db.status.on('edittest1', function() {
  db.user.get({username : "testuser"}, function(err, user) {
    if (err) { throw err; }
    var edittest2 = user;
    edittest2.phone = "1234567";
    db.user.save(edittest2, function(err, res) {
      //console.log('edit test 1');
      if (err) { throw err; }
      db.user.get(edittest2.id, function(err, res) {
        if (err) { throw err; }
        if (res.phone != edittest2.phone) {
          console.log(res.phone, edittest2.phone);
          throw new Error("edit test 2 failed");
        } else {
          console.log('edit test 2 pass');
          db.status.emit('edittest2');
        }
      });
    });
  });
});

db.status.on('edittest2', function() {
  var deltest = {id : 1};
  db.user.delete(deltest, function(err, res) {
    //console.log('delete test 1');
    if (err) { throw err; }
    db.user.exists({id : 1}, function(err, exists) {
      if (err) { throw err; }
      if (exists) {
        throw new Error("delete test 1 failed");
      } else {
        console.log('delete test 1 pass');
        db.status.emit('deltest1');
      }
    });
  });
});

db.status.on('deltest1', function() {
  db.user.add({id: 1, username : "testuser", password : "user", email : "a@s.df"}, function(err, res) {
    if (err) { throw err; }
    db.user.get(1, function(err, user) {
      //console.log('delete test 2');
      if (err) { throw err; }
      var deltest = {id : 1};
      db.user.delete(deltest, function(err, res) {
        if (err) { throw err; }
        db.user.exists({id : 1}, function(err, exists) {
          if (err) { throw err; }
          if (exists) {
            throw new Error("delete test 2 failed");
          } else {
            console.log('delete test 2 pass');
            db.status.emit('deltest2');
          }
        });
      });
    });
  });
});
// Object combiner

var Context = function(args) {
  this.add(args);
};

Context.prototype.add = function(args) {
  if (typeof args == 'object') {
    if (args && args.constructor === Array) {
      for (var i in args) {
        this._add(args);
      }
    } else {
      this._add(args);
    }
  }
};

Context.prototype._add = function(obj) {
  for (var pname in obj) {
    var prop = obj[pname];
    if (prop && prop.constructor === Array) {
      if (!this[pname]) {
        this[pname] = [];
      } else if (this[pname].constructor !== Array) {
        this[pname] = [this[pname]];
      }
      this[pname] = this[pname].concat(prop);
    } else if (typeof prop == 'object') {
      if (!this[pname] || typeof this[pname] != 'object' || this[pname].constructor === Array) {
        this[pname] = prop;
      } else {
        Context.prototype._add.call(this[pname], prop);
      }
    } else {
      this[pname] = prop;
    }
  }
};

/*
var a = new Context({
  a : {},
  b : 0,
  c : [],
  d : {a : {a : 1}},
  e : [1, 2, 3]
});
a.add({
  a : {a : 2},
  c : [1],
  d : {a : {b : 1}},
  e : [4, 5, 6],
  f : {a : {b : 1}},
});
console.log(a);
*/

module.exports = Context;
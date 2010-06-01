/**
* @private Returns a prototype object suitable for extending the given class
* <tt>f</tt>. Rather than constructing a new instance of <tt>f</tt> to serve as
* the prototype (which unnecessarily runs the constructor on the created
* prototype object, potentially polluting it), an anonymous function is
* generated internally that shares the same prototype:
*
* <pre>function g() {}
* g.prototype = f.prototype;
* return new g();</pre>
*
* For more details, see Douglas Crockford's essay on prototypal inheritance.
*
* @param {function} f a constructor.
* @returns a suitable prototype object.
* @see Douglas Crockford's essay on <a
* href="http://javascript.crockford.com/prototypal.html">prototypal
* inheritance</a>.
*/

Object.extend = function (f) {
  function G() {}
  G.prototype = f.prototype || f;
  return new G();
};


Object.create = function (o) {
  function F() {}
  F.prototype = o;
  return new F();
};


// Usage:
// 
// ["a","b", "c"].eachItem(function(item, index) {
//   console.log(item);
// });

if (!Array.prototype.eachItem) {
  Array.prototype.eachItem = function (f, o) {
    var n = this.length || 0,
        i;
    for (i = 0; i < n; i += 1) {
      if (i in this) {
        f.call(o, this[i], i, this);
      }
    }
  };
}

Object.keys = function (obj) {
  var array = [],
      prop;
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      array.push(prop);
    }
  }
  return array;
};
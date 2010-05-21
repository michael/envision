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

Object.extend = function(f) {
  function g() {}
  g.prototype = f.prototype || f;
  return new g();
};


Object.create = function (o) {
  function F() {}
  F.prototype = o;
  return new F();
};

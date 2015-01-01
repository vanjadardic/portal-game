'use strict';

/**
 * @class Line represented in standard form: ax + by + c = 0.
 * @param {Number} a The a coefficient.
 * @param {Number} b The b coefficient.
 * @param {Number} c The c coefficient.
 */
function Line(a, b, c) {
   /**
    * The a coefficient.
    * @type Number
    */
   this.a = a;
   /**
    * The b coefficient.
    * @type Number
    */
   this.b = b;
   /**
    * The c coefficient.
    * @type Number
    */
   this.c = c;
}

/**
 * @returns {Number}
 */
Line.prototype.getSlope = function() {
   return this.k || (this.k = -this.a / this.b);
};

/**
 * @returns {Number}
 */
Line.prototype.getYIntercept = function() {
   return this.n || (this.n = -this.c / this.b);
};

/**
 * @returns {Line}
 */
Line.prototype.clone = function() {
   return new Line(this.a, this.b, this.c);
};
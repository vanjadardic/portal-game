'use strict';

/**
 * @class Point represented with (x, y) coordinates.
 * @param {Number} x The x coordinate.
 * @param {Number} y The y coordinate.
 */
function Point(x, y) {
   /**
    * The x coordinate.
    * @type {Number}
    */
   this.x = x;
   /**
    * The y coordinate.
    * @type {Number}
    */
   this.y = y;
}

/**
 * @returns {Point}
 */
Point.prototype.clone = function() {
   return new Point(this.x, this.y);
};

/**
 * @param {Point} otherPoint
 * @returns {Boolean}
 */
Point.prototype.equals = function(otherPoint) {
   return this.x === otherPoint.x && this.y === otherPoint.y;
};

/**
 * Checks if the Manhattan distance to the other point is close to zero using {@link Util.compareFloats}.
 * @param {Point} otherPoint
 * @returns {Boolean}
 */
Point.prototype.almostEquals = function(otherPoint) {
   return Util.compareFloats(this.x - otherPoint.x, this.y - otherPoint.y) === 0;
};
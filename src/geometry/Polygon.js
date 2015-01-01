'use strict';

/**
 * @class Polygon represented by an array of points.
 * @param {Point[]} points Points that represent the polygon.
 */
function Polygon(points) {
   /**
    * Points that represent the polygon.
    * @type {Point[]}
    */
   this.points = points;
}

/**
 * @returns {Line[]}
 */
Polygon.prototype.getLineSegments = function() {
   if (this.lines) {
      return this.lines;
   }
   this.lines = [];
   for (var i = 0; i < this.points.length; i++) {
      this.lines.push(new LineSegment(this.points[i], this.points[(i + 1) % this.points.length]));
   }
   return this.lines;
};

/**
 * @returns {Polygon}
 */
Polygon.prototype.clone = function() {
   var newPoints = this.points.slice(0);
   for (var i = 0; i < newPoints.length; i++) {
      newPoints[i] = newPoints[i].clone();
   }
   return new Polygon(newPoints);
};
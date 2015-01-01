'use strict';

/**
 * @class Line segment represented by two points.
 * @param {Point} point1 First point.
 * @param {Point} point2 Second point.
 */
function LineSegment(point1, point2) {
   /**
    * First point.
    * @type {Point}
    */
   this.point1 = point1;
   /**
    * Second point.
    * @type {Point}
    */
   this.point2 = point2;
}

/**
 * Checks if the Manhattan distance between the two points is close to zero using {@link Util.compareFloats}.
 * @returns {Boolean}
 */
LineSegment.prototype.samePoints = function() {
   return Util.compareFloats(this.point1.x - this.point2.x, this.point1.y - this.point2.y) === 0;
};

/**
 * @returns {Line}
 */
LineSegment.prototype.getLine = function() {
   return this.line || (this.line = new Line(
      this.point2.y - this.point1.y,
      this.point1.x - this.point2.x,
      this.point2.x * this.point1.y - this.point1.x * this.point2.y));
};

/**
 * @returns {LineSegment}
 */
LineSegment.prototype.clone = function() {
   return new LineSegment(this.point1.clone(), this.point2.clone());
};

/**
 * Extends one point of this line segment to the edge.
 * @param {Number} which
 * @param {Number} edge
 * @returns {LineSegment}
 */
LineSegment.prototype.extendPoint = function(which, edge) {
   var point1 = which === 1 ? this.point1 : this.point2;
   var point2 = which === 1 ? this.point2 : this.point1;
   var dx = point2.x - point1.x;
   var dy = point2.y - point1.y;
   var multi = Math.min(
      Math.max((point1.x + edge) / dx, (point1.x - edge) / dx),
      Math.max((point1.y + edge) / dy, (point1.y - edge) / dy));
   point1.x -= dx * multi;
   point1.y -= dy * multi;
   return this;
};

/**
 * Extends both points of this line segment to the edge.
 * @param {Number} edge
 * @returns {LineSegment}
 */
LineSegment.prototype.extend = function(edge) {
   this.extendPoint(1, edge);
   this.extendPoint(2, edge);
   return this;
};

/**
 * Creates a square with this line segment as one of its sides.
 * @param {Number} orientation
 * @returns {Polygon}
 */
LineSegment.prototype.createSquare = function(orientation) {
   var p1 = this.point1.clone();
   var p2 = this.point2.clone();
   var p3 = new Point(p2.x + (p2.y - p1.y) * orientation, p2.y - (p2.x - p1.x) * orientation);
   var p4 = new Point(p3.x + (p3.y - p2.y) * orientation, p3.y - (p3.x - p2.x) * orientation);
   return new Polygon([p1, p2, p3, p4]);
};
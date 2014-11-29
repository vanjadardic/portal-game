'use strict';

//<editor-fold defaultstate="collapsed" desc="Point">
/**
 * Creates a new point.
 * 
 * @class Point represented with (x, y) coordinates.
 * @param {Number} x The x coordinate.
 * @param {Number} y The y coordinate.
 */
function Point(x, y) {
   /** The x coordinate. @type {Number} */
   this.x = x;
   /** The y coordinate. @type {Number} */
   this.y = y;
}

/**
 * 
 * @returns {Point}
 */
Point.prototype.clone = function() {
   return new Point(this.x, this.y);
};

/**
 * 
 * @param {Point} otherPoint
 * @returns {Boolean}
 */
Point.prototype.equals = function(otherPoint) {
   return this.x === otherPoint.x && this.y === otherPoint.y;
};

/**
 * 
 * @param {Point} otherPoint
 * @param {Number} e
 * @returns {Boolean}
 */
Point.prototype.almostEquals = function(otherPoint, e) {
   return Util.compareFloats(this.x, otherPoint.x, e) === 0 && Util.compareFloats(this.y, otherPoint.y, e) === 0;
};
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="Line">
/**
 * Creates a new line.
 * 
 * @class Line represented in standard form: ax + by + c = 0.
 * @param {Number} a The a coefficient.
 * @param {Number} b The b coefficient.
 * @param {Number} c The c coefficient.
 */
function Line(a, b, c) {
   /** The a coefficient. @type Number */
   this.a = a;
   /** The b coefficient. @type Number */
   this.b = b;
   /** The c coefficient. @type Number */
   this.c = c;
}

/**
 * 
 * @returns {Number}
 */
Line.prototype.getSlope = function() {
   return this.k || (this.k = -this.a / this.b);
};

/**
 * 
 * @returns {Number}
 */
Line.prototype.getYIntercept = function() {
   return this.n || (this.n = -this.c / this.b);
};

/**
 * 
 * @returns {Line}
 */
Line.prototype.clone = function() {
   return new Line(this.a, this.b, this.c);
};
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="LineSegment">
/**
 * Creates a new line segment.
 * 
 * @class Line segment represented by two points.
 * @param {Point} point1 First point.
 * @param {Point} point2 Second point.
 */
function LineSegment(point1, point2) {
   /** First point. @type {Point} */
   this.point1 = point1;
   /** Second point. @type {Point} */
   this.point2 = point2;
}

/**
 * 
 * @returns {Boolean}
 */
LineSegment.prototype.samePoints = function() {
   return Util.compareFloats(this.point1.x, this.point2.x) === 0 && Util.compareFloats(this.point1.y, this.point2.y) === 0;
};

/**
 * 
 * @returns {Line}
 */
LineSegment.prototype.getLine = function() {
   return this.line || (this.line = new Line(
      this.point2.y - this.point1.y,
      this.point1.x - this.point2.x,
      this.point2.x * this.point1.y - this.point1.x * this.point2.y));
};

/**
 * 
 * @returns {LineSegment}
 */
LineSegment.prototype.clone = function() {
   return new LineSegment(this.point1.clone(), this.point2.clone());
};

/**
 * 
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
 * 
 * @param {Number} edge
 * @returns {LineSegment}
 */
LineSegment.prototype.extend = function(edge) {
   this.extendPoint(1, edge);
   this.extendPoint(2, edge);
   return this;
};

/**
 * 
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
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="Polygon">
/**
 * Creates a new polygon.
 * 
 * @class Polygon represented by an array of points.
 * @param {Point[]} points Points that represent the polygon.
 */
function Polygon(points) {
   /** Points that represent the polygon. @type {Point[]} */
   this.points = points;
}

/**
 * 
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
 * 
 * @returns {Polygon}
 */
Polygon.prototype.clone = function() {
   var newPoints = this.points.slice(0);
   for (var i = 0; i < newPoints.length; i++) {
      newPoints[i] = newPoints[i].clone();
   }
   return new Polygon(newPoints);
};
//</editor-fold>

/**
 * Returns the point of intersection if lines are not parallel, false otherwise.
 * 
 * @param {Line} line1
 * @param {Line} line2
 * @returns {Boolean|Point}
 */
function intersectLL(line1, line2) {
   if (line1.a === 0 && line2.a === 0 || line1.b === 0 && line2.b === 0 || line1.getSlope() === line2.getSlope()) {
      // lines are parallel
      return false;
   }
   var x, y;
   if (line1.a === 0 && line2.b === 0) {
      // line1 is horizontal, line2 is vertical
      x = -line2.c / line2.a;
      y = -line1.c / line1.b;
   } else if (line2.a === 0 && line1.b === 0) {
      // line1 is vertical, line2 is horizontal
      x = -line1.c / line1.a;
      y = -line2.c / line2.b;
   } else if (line1.a === 0) {
      // line1 is horizontal, line2 is sloped
      y = -line1.c / line1.b;
      x = -line2.b / line2.a * y - line2.c / line2.a;
   } else if (line1.b === 0) {
      // line1 is vertical, line2 is sloped
      x = -line1.c / line1.a;
      y = -line2.a / line2.b * x - line2.c / line2.b;
   } else if (line2.a === 0) {
      // line1 is sloped, line2 is horizontal
      y = -line2.c / line2.b;
      x = -line1.b / line1.a * y - line1.c / line1.a;
   } else if (line2.b === 0) {
      // line1 is sloped, line2 is vertical
      x = -line2.c / line2.a;
      y = -line1.a / line1.b * x - line1.c / line1.b;
   } else {
      // both lines are sloped
      x = (line2.getYIntercept() - line1.getYIntercept()) / (line1.getSlope() - line2.getSlope());
      y = line1.getSlope() * x + line1.getYIntercept();
   }
   return new Point(x, y);
}

/**
 * Returns the point of intersection if the line and line segment are not parallel and intersect, false otherwise.
 * 
 * @param {Line} line
 * @param {LineSegment} lineSegment
 * @returns {Boolean|Point}
 */
function intersectLLS(line, lineSegment) {
   var poi = intersectLL(line, lineSegment.getLine());
   if (poi === false) {
      return false;
   }
   return isPointInRect(lineSegment.point1, lineSegment.point2, poi) ? poi : false;
}

/**
 * Returns the point of intersection if the two line segments are not parallel and intersect, false otherwise.
 * 
 * @param {LineSegment} lineSegment1
 * @param {LineSegment} lineSegment2
 * @returns {Point|Boolean}
 */
function intersectLSLS(lineSegment1, lineSegment2) {
   var poi = intersectLL(lineSegment1.getLine(), lineSegment2.getLine());
   if (poi === false) {
      return false;
   }
   return (isPointInRect(lineSegment1.point1, lineSegment1.point2, poi) && isPointInRect(lineSegment2.point1, lineSegment2.point2, poi)) ? poi : false;
}

/**
 * Splits a convex polygon with the line.
 * 
 * @param {Line} line Line that splits the polygon.
 * @param {Polygon} polygon Polygon that will be split by the line.
 * @returns {Polygon[]}
 */
function splitPolygon(line, polygon) {
   var polygons = [new Polygon([]), new Polygon([])],
      which = 0, poi, prevPoi = false, poiCount = 0, i, j;
   for (i = 0; i < polygon.getLineSegments().length; i++) {
      poi = intersectLLS(line, polygon.getLineSegments()[i]);
      if (prevPoi && poi && prevPoi.almostEquals(poi)) {
         prevPoi = poi;
         poi = false;
      }
      prevPoi = poi;
      if (poi) {
         polygons[0].points.push(poi);
         polygons[1].points.push(poi.clone());
         which = (which + 1) % 2;
         poiCount++;
      }
      polygons[which].points.push(polygon.getLineSegments()[i].point2.clone());
   }
   if (poiCount <= 1) {
      polygons = [polygon.clone()];
   }
   for (i = polygons.length - 1; i >= 0; i--) {
      for (j = polygons[i].points.length - 1; j >= 0; j--) {
         var p1 = polygons[i].points[j];
         var p2 = polygons[i].points[(j + 1) % polygons[i].points.length];
         if (Util.compareFloats(p1.x, p2.x) === 0 && Util.compareFloats(p1.y, p2.y) === 0) {
            polygons[i].points.splice(j, 1);
         }
      }
      if (polygons[i].points.length < 3) {
         polygons.splice(i, 1);
      }
   }
   return polygons;
}

/**
 * Checks on which side of a line denoted by points a and b point c is.
 * 
 * @param {Point} a
 * @param {Point} b
 * @param {Point} c
 * @returns {Number} 0 if the point is on the line, -1 or 1 otherwise.
 */
function whichSidePoint(a, b, c) {
   return Util.compareFloats((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x), 0);
}

/**
 * Checks on which side of a line denoted by points a and b polygon is.
 * 
 * @param {Point} a
 * @param {Point} b
 * @param {Polygon} polygon
 * @returns {Number}
 */
function whichSidePolygon(a, b, polygon) {
   var tmp1 = b.x - a.x, tmp2 = b.y - a.y, sum = 0, i;
   for (i = 0; i < polygon.points.length; i++) {
      sum += tmp1 * (polygon.points[i].y - a.y) - tmp2 * (polygon.points[i].x - a.x);
   }
   return Util.compareFloats(sum, 0);
}

/**
 * Calculates the distance between points a and b.
 * 
 * @param {Point} a
 * @param {Point} b
 * @returns {Number}
 */
function distancePP(a, b) {
   var dx = b.x - a.x, dy = b.y - a.y;
   return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the perpendicular distance of point c from line denoted by points a and b.
 * 
 * @param {Point} a
 * @param {Point} b
 * @param {Point} c
 * @returns {Number}
 */
function distanceLP(a, b, c) {
   var dx = b.x - a.x, dy = b.y - a.y;
   return Math.abs(dy * c.x - dx * c.y - a.x * b.y + b.x * a.y) / Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a point p is inside a rectangle denoted by diagonal endpoints a and b.
 * 
 * @param {Point} a
 * @param {Point} b
 * @param {Point} p
 * @returns {Boolean}
 */
function isPointInRect(a, b, p) {
   return (
      (Util.compareFloats(p.x, a.x) >= 0 && Util.compareFloats(p.x, b.x) <= 0 ||
         Util.compareFloats(p.x, b.x) >= 0 && Util.compareFloats(p.x, a.x) <= 0) &&
      (Util.compareFloats(p.y, a.y) >= 0 && Util.compareFloats(p.y, b.y) <= 0 ||
         Util.compareFloats(p.y, b.y) >= 0 && Util.compareFloats(p.y, a.y) <= 0));
}

//<editor-fold defaultstate="collapsed" desc="Circle">
/**
 * Creates a new circle.
 * 
 * @class Circle represented with x and y coordinates, and radius r.
 * @param {Number} x The x coordinate.
 * @param {Number} y The y coordinate.
 * @param {Number} r The radius r.
 */
function Circle(x, y, r) {
   /** The x coordinate. @type {Number} */
   this.x = x;
   /** The y coordinate. @type {Number} */
   this.y = y;
   /** The radius r. @type {Number} */
   this.r = r;
}

/**
 * 
 * @returns {Circle}
 */
Circle.prototype.clone = function() {
   return new Circle(this.x, this.y, this.r);
};
//</editor-fold>

/**
 * Returns intersect points between a line and a circle.
 * 
 * @param {Circle} circle
 * @param {Line} line
 * @returns {Boolean|Point[]} Array of intersect points if there are any, false otherwise.
 */
function intersectCL(circle, line) {
   var a, b, c, incidence, x1, y1, x2, y2, t1, t2, t3;
   if (Math.abs(line.b) > Math.abs(line.a)) {
      t1 = -line.a / line.b;
      t2 = -line.c / line.b;
      a = 1 + t1 * t1;
      b = -2 * circle.x + 2 * (t2 - circle.y) * t1;
      c = -circle.r * circle.r + (t2 - circle.y) * (t2 - circle.y) + circle.x * circle.x;
      incidence = b * b - 4 * a * c;
      if (incidence < 0) {
         return false;
      } else if (Util.compareFloats(incidence, 0) === 0) {
         x1 = -b / (2 * a);
         y1 = t2 + t1 * x1;
         return [new Point(x1, y1)];
      } else {
         t3 = Math.sqrt(incidence);
         x1 = (-b + t3) / (2 * a);
         y1 = t2 + t1 * x1;
         x2 = (-b - t3) / (2 * a);
         y2 = t2 + t1 * x2;
         return [new Point(x1, y1), new Point(x2, y2)];
      }
   } else {
      t1 = -line.b / line.a;
      t2 = -line.c / line.a;
      a = 1 + t1 * t1;
      b = -2 * circle.y + 2 * (t2 - circle.x) * t1;
      c = -circle.r * circle.r + (t2 - circle.x) * (t2 - circle.x) + circle.y * circle.y;
      incidence = b * b - 4 * a * c;
      if (incidence < 0) {
         return false;
      } else if (Util.compareFloats(incidence, 0) === 0) {
         y1 = -b / (2 * a);
         x1 = t2 + t1 * y1;
         return [new Point(x1, y1)];
      } else {
         t3 = Math.sqrt(incidence);
         y1 = (-b + t3) / (2 * a);
         x1 = t2 + t1 * y1;
         y2 = (-b - t3) / (2 * a);
         x2 = t2 + t1 * y2;
         return [new Point(x1, y1), new Point(x2, y2)];
      }
   }
}

/**
 * Returns intersect points between a line segment and a circle.
 * 
 * @param {Circle} circle
 * @param {LineSegment} lineSegment
 * @returns {Boolean|Point[]} Array of intersect points if there are any, false otherwise.
 */
function intersectCLS(circle, lineSegment) {
   var poi = intersectCL(circle, lineSegment.getLine());
   if (poi === false) {
      return false;
   }
   for (var i = poi.length - 1; i >= 0; i--) {
      if (!isPointInRect(lineSegment.point1, lineSegment.point2, poi[i])) {
         poi.splice(i, 1);
      }
   }
   return poi.length > 0 ? poi : false;
}

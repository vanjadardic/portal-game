'use strict';

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
 * Returns the point of intersection if the half-line and line segment are not parallel and intersect, false otherwise.
 * 
 * @param {LineSegment} halfLine
 * @param {LineSegment} lineSegment
 * @returns {Boolean|Point}
 */
function intersectHLLS(halfLine, lineSegment) {
   var poi = intersectLL(halfLine.getLine(), lineSegment.getLine());
   if (poi === false) {
      return false;
   }
   return (isPointInHalfRect(halfLine.point1, halfLine.point2, poi) &&
      isPointInRect(lineSegment.point1, lineSegment.point2, poi)) ? poi : false;
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

function isPointInHalfRect(a, b, p) {
   return (
      (Util.compareFloats(p.x, a.x) >= 0 && Util.compareFloats(b.x, a.x) >= 0 ||
         Util.compareFloats(p.x, a.x) <= 0 && Util.compareFloats(b.x, a.x) <= 0) &&
      (Util.compareFloats(p.y, a.y) >= 0 && Util.compareFloats(b.y, a.y) >= 0 ||
         Util.compareFloats(p.y, a.y) <= 0 && Util.compareFloats(b.y, a.y) <= 0));
}

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

function checkParallel(line1, line2) {
   return Util.compareFloats(line1.a * line2.b, line2.a * line1.b) === 0;
}

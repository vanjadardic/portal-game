'use strict';

var Util = {};

/**
 * Return -1 if a &lt; b, 0 if a == b, 1 if a &gt; b.
 * 
 * @param {Number} a First value.
 * @param {Number} b Second value.
 * @param {Number} [e=0.001] Epsilon value.
 * @returns {Number}
 */
Util.compareFloats = function(a, b, e) {
   return Math.abs(a - b) < (e || 0.001) ? 0 : (a < b ? -1 : 1);
};

Util.setTransform = function(ctx, matrix) {
   ctx.setTransform(matrix.coef[0][0], matrix.coef[1][0], matrix.coef[0][1], matrix.coef[1][1], matrix.coef[0][2], matrix.coef[1][2]);
};

Util.transform = function(ctx, matrix) {
   ctx.transform(matrix.coef[0][0], matrix.coef[1][0], matrix.coef[0][1], matrix.coef[1][1], matrix.coef[0][2], matrix.coef[1][2]);
};

Util.fillRect = function(ctx, x, y, width, height, color) {
   ctx.fillStyle = color;
   ctx.fillRect(x, y, width, height);
};

Util.createPath = function(ctx, points) {
   ctx.beginPath();
   for (var i = 0; i < points.length; i++) {
      ctx[i === 0 ? 'moveTo' : 'lineTo'](points[i].x, points[i].y);
   }
};

Util.drawLine = function(ctx, points, width, color) {
   Util.createPath(ctx, points);
   ctx.lineWidth = width;
   ctx.strokeStyle = color;
   ctx.stroke();
};

Util.fillPolygon = function(ctx, points, color) {
   Util.createPath(ctx, points);
   ctx.fillStyle = color;
   ctx.fill();
};

Util.extendToEdge = function(point1, point2, edge) {
   if (point1.almostEquals(point2)) {
      return false;
   }
   while (Math.abs(point2.x) < edge && Math.abs(point2.y) < edge) {
      point2.x += point2.x - point1.x;
      point2.y += point2.y - point1.y;
   }
   return true;
};

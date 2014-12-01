'use strict';

/**
 * @param {Point[]} points Endpoints of a portal.
 * @param {String} color Color of the portal.
 * @constructor
 */
function Portal(points, color) {
   this.points = points;
   this.color = color;
}

/**
 * Defaults for the {@link Portal}.
 */
Portal.default = {
   size: 2,
   width: 0.2
};

/**
 * Clones a {@link Portal} object.
 * @returns {Portal}
 */
Portal.prototype.clone = function() {
   var points = this.points.slice(0);
   for (var i = 0; i < points.length; i++) {
      points[i] = points[i].clone();
   }
   return new Portal(points, this.color);
};

/**
 * Draws the {@link Portal} on the canvas.
 * @param ctx
 */
Portal.prototype.draw = function(ctx) {
   Util.drawLine(ctx, this.points, Portal.default.width, this.color);
};

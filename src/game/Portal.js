'use strict';

/**
 * @param {Point[]} points Endpoints of a portal.
 * @param {Number} id Identificator of the portal, 0 for blue, 1 for yellow.
 * @param {String} color Override default color for this type of portal.
 * @constructor
 */
function Portal(points, id, color) {
   this.points = points;
   this.id = id;
   this.color = color || (this.id === 0 ? 'blue' : 'yellow');
}

/**
 * Defaults for the {@link Portal}.
 */
Portal.default = {
   size: 2,
   width: 0.2
};

/**
 * Clones a {@link Portal}.
 * @returns {Portal}
 */
Portal.prototype.clone = function() {
   var points = this.points.slice(0);
   for (var i = 0; i < points.length; i++) {
      points[i] = points[i].clone();
   }
   return new Portal(points, this.id);
};

/**
 * Draws the {@link Portal} on the canvas.
 * @param ctx
 */
Portal.prototype.draw = function(ctx) {
   Util.drawLine(ctx, this.points, Portal.default.width, this.color);
};

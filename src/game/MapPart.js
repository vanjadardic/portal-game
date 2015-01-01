'use strict';

/**
 * @class
 * @param {Polygon} polygon {@link Polygon} that represents this map part.
 * @param {Object} type Type of the map part. Should be an object from {@link MapPart.type}.
 */
function MapPart(polygon, type) {
   this.polygon = polygon;
   this.type = type;
}

/**
 * All types for the {@link MapPart} that are supported.
 */
MapPart.type = {
   SOLID: {
      color: '#888',
      supportsPortal: true
   },
   EMPTY: {
      color: '#000',
      supportsPortal: false
   }
};

/**
 * Clones a {@link MapPart}.
 * @returns {MapPart}
 */
MapPart.prototype.clone = function () {
   return new MapPart(this.polygon.clone(), this.type);
};

/**
 * Draws the {@link MapPart} on the canvas.
 * @param ctx
 * @param {String} color Overrides color.
 */
MapPart.prototype.draw = function (ctx, color) {
   if (this.polygon.points.length < 3) {
      return;
   }
   Util.fillPolygon(ctx, this.polygon.points, color || this.type.color);
};

'use strict';

/**
 * @class
 * @param {MapPart} mapParts Array of {@link MapPart}s to initialize this {@link Map} with. Can be empty.
 */
function Map(mapParts) {
   this.mapParts = mapParts || [];
}

/**
 * Adds a {@link MapPart} to this {@link Map}.
 * @param {MapPart} mapPart
 */
Map.prototype.addMapPart = function (mapPart) {
   this.mapParts.push(mapPart);
};

/**
 * Clones a {@link Map}.
 * @returns {Map}
 */
Map.prototype.clone = function () {
   var newMapParts = this.mapParts.slice(0);
   for (var i = 0; i < newMapParts.length; i++) {
      newMapParts[i] = newMapParts[i].clone();
   }
   return new Map(newMapParts);
};

/**
 * Draws the {@link Map} on the canvas.
 * @param ctx
 */
Map.prototype.draw = function (ctx) {
   for (var i = 0; i < this.mapParts.length; i++) {
      this.mapParts[i].draw(ctx);
   }
};

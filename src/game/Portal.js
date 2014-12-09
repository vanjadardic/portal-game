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

/**
 * Checks if the {@link Portal} can be created at current player and mouse positions.
 * @param {Point} playerPosition
 * @param {Point} mousePosition
 * @param {Map} map
 * @returns {Point[2]|Boolean} Two endpoints of a {@link Portal}, or false if it can't be created at this position.
 */
Portal.getPortalPlaceholder = function(playerPosition, mousePosition, map) {
   var playerHalfLine = new LineSegment(playerPosition, mousePosition);

   // if player and mouse positions are same, then portal can't be created
   if (playerHalfLine.samePoints()) {
      return false;
   }

   // intersect player half-line with all map part line segments, and find the intersection closest to the player
   var portalCenter;
   var mapLineSegment;
   var distance = false;
   for (var i = 0; i < map.mapParts.length; i++) {
      // only check map parts that support portal
      if (!map.mapParts[i].type.supportsPortal) {
         continue;
      }
      var mapPartSegments = map.mapParts[i].polygon.getLineSegments();
      for (var j = 0; j < mapPartSegments.length; j++) {
         var poi = intersectHLLS(playerHalfLine, mapPartSegments[j]);
         if (poi) {
            var d = distancePP(playerPosition, poi);
            if (distance === false || d < distance) {
               portalCenter = poi;
               mapLineSegment = mapPartSegments[j];
               distance = d;
            }
         }
      }
   }

   // if intersection wasn't found, then portal can't be created
   if (distance === false) {
      return false;
   }

   var portalEndpoints = intersectCLS(new Circle(portalCenter.x, portalCenter.y, Portal.default.size / 2), mapLineSegment);
   // portal can't be created at this position (it's too close to the edge)
   if (!portalEndpoints || portalEndpoints.length !== 2) {
      return;
   }

   // check if the portal intersects with some other map part
   var portalLineSegment = new LineSegment(portalEndpoints[0], portalEndpoints[1]);
   L1:for (var i = 0; i < map.mapParts.length; i++) {
      if (!map.mapParts[i].type.supportsPortal) {
         continue;
      }
      for (var j = 0; j < map.mapParts[i].polygon.getLineSegments().length; j++) {
         if (mapLineSegment !== map.mapParts[i].polygon.getLineSegments()[j]) {
            var poi = intersectLSLS(portalLineSegment, map.mapParts[i].polygon.getLineSegments()[j]);
            if (poi !== false) {
               return;
            }
         }
      }
   }

   return portalEndpoints;
};
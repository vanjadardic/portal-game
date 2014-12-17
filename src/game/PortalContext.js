'use strict';

/**
 * Creates and keeps track of the 2 {@link Portal}s.
 * @constructor
 */
function PortalContext() {
   this.portals = [null, null];
}

/**
 * Checks if both {@link Portal}s are active.
 * @returns {Boolean}
 */
PortalContext.prototype.bothPortals = function() {
   return this.portals[0] !== null && this.portals[1] !== null;
};

/**
 * Checks if the {@link Portal} can be created at current {@link Player} and mouse positions.
 * @param {type} which id of the {@link Portal} to be created.
 * @param {type} portalEndpoints
 * @param {type} playerPosition
 * @returns {Portal|Boolean} The {@link Portal} if it was possible to create it, false otherwise.
 */
PortalContext.prototype.setPortal = function(which, portalEndpoints, playerPosition) {
   var other = (which + 1) % 2;
   // if this is the only active portal, than just create it
   if (this.portals[other] === null) {
      var ws = whichSidePoint(portalEndpoints[0], portalEndpoints[1], playerPosition);
      return this.portals[which] = new Portal([portalEndpoints[ws > 0 ? 0 : 1], portalEndpoints[ws > 0 ? 1 : 0]], which);
   }
   // if the other portal is active, make sure the new portal doesn't intersect with it
   // first check if the portal are not parallel, that means they are definitely not on the same surface
   // if they are, check that they don't overlap
   if (!checkParallel(new LineSegment(this.portals[other].points[0], this.portals[other].points[1]).getLine(), new LineSegment(portalEndpoints[0], portalEndpoints[1]).getLine())
      || (!isPointInRect(this.portals[other].points[0], this.portals[other].points[1], portalEndpoints[0])
         && !isPointInRect(this.portals[other].points[0], this.portals[other].points[1], portalEndpoints[1]))) {
      var ws = whichSidePoint(portalEndpoints[0], portalEndpoints[1], playerPosition);
      this.portals[which] = new Portal([portalEndpoints[ws > 0 ? 0 : 1], portalEndpoints[ws > 0 ? 1 : 0]], which);
      this.precalculatePortals();
      return this.portals[which];
   }
   return false;
};

/**
 * Precalculate some values for the {@link Portal}s.
 * @returns {undefined}
 */
PortalContext.prototype.precalculatePortals = function() {
   for (var i = 0; i < 2; i++) {
      var p = this.portals[i];
      p.calcs = {};
      // middle of the portal
      p.calcs.midPoint = new Point(p.points[0].x + (p.points[1].x - p.points[0].x) / 2, p.points[0].y + (p.points[1].y - p.points[0].y) / 2);
      // angle of the portal
      p.calcs.alpha = Math.atan2(p.points[1].y - p.points[0].y, p.points[1].x - p.points[0].x);
   }
   for (var i = 0; i < 2; i++) {
      var p0 = this.portals[i];
      var p1 = this.portals[(i + 1) % 2];
      // calculate angle to other portal
      p0.calcs.theta = p1.calcs.alpha - p0.calcs.alpha;
      // and normalize it between (-pi, pi)
      p0.calcs.theta += p0.calcs.theta <= -Math.PI ? 2 * Math.PI : (p0.calcs.theta > Math.PI ? -2 * Math.PI : 0);
      // check if the portals mirror the image
      p0.calcs.mirror = p0.calcs.theta > -Math.PI / 2 && p0.calcs.theta < Math.PI / 2;
      p0.calcs.portalMatrix =
         Matrix.createTranslationMatrix(p0.calcs.midPoint.x, p0.calcs.midPoint.y).
         rotate(-p0.calcs.alpha).
         scale(p0.calcs.mirror ? 1 : -1, -1).
         rotate(p1.calcs.alpha).
         translate(-p1.calcs.midPoint.x, -p1.calcs.midPoint.y);
      p0.calcs.invPortalMatrix =
         Matrix.createTranslationMatrix(p1.calcs.midPoint.x, p1.calcs.midPoint.y).
         rotate(-p1.calcs.alpha).
         scale(p0.calcs.mirror ? 1 : -1, -1).
         rotate(p0.calcs.alpha).
         translate(-p0.calcs.midPoint.x, -p0.calcs.midPoint.y);
      // can this portal be seen through itself
      p0.calcs.drawAnotherPortal =
         whichSidePoint(p0.points[0], p0.points[1], p0.calcs.invPortalMatrix.transform(p0.points[0])) === 1 ||
         whichSidePoint(p0.points[0], p0.points[1], p0.calcs.invPortalMatrix.transform(p0.points[1])) === 1;
      // clipping line that is parallel to the portal itself
      p0.calcs.clip1 = new LineSegment(p0.calcs.invPortalMatrix.transform(p0.points[0]), p0.calcs.invPortalMatrix.transform(p0.points[1])).extend(G.edgeOfLevel).createSquare(p0.calcs.mirror ? -1 : 1).points;
   }
};

/**
 * Calculates some values for the {@link Portal} based on the {@link Player}s current position.
 * @param {type} which
 * @param {type} playerPosition
 * @returns {undefined}
 */
PortalContext.prototype.calculatePortal = function(which, playerPosition) {
   var p = this.portals[which];
   // player's distance to portal
   p.calcs.playerDistance = distancePP(p.calcs.midPoint, playerPosition);
   // on which side of the portal the player is
   p.calcs.playerSide = whichSidePoint(p.points[0], p.points[1], playerPosition);
   // checks if the player in on top of the portal, but not on the edges of it
   p.calcs.playerOnPortal = whichSidePoint(p.points[0], p.points[1], playerPosition) === 0 && isPointInRect(p.points[0], p.points[1], playerPosition) &&
      (Util.compareFloats(p.points[0].x, playerPosition.x) !== 0 || Util.compareFloats(p.points[0].y, playerPosition.y) !== 0) &&
      (Util.compareFloats(p.points[1].x, playerPosition.x) !== 0 || Util.compareFloats(p.points[1].y, playerPosition.y) !== 0);
   if (p.calcs.playerSide >= 0) {
      // two lines that limit the players viewport through the portal
      p.calcs.viewportLimit = [null, null];
      for (var j = 0; j < 2; j++) {
         p.calcs.viewportLimit[j] = new LineSegment(p.calcs.invPortalMatrix.transform(playerPosition), p.calcs.invPortalMatrix.transform(p.points[j]));
         if (p.calcs.viewportLimit[j].samePoints()) {
            p.calcs.viewportLimit[j] = null;
            continue;
         }
         var tmp = p.calcs.viewportLimit[j].point2.clone();
         p.calcs.viewportLimit[j].extendPoint(2, G.edgeOfLevel);
         p.calcs.viewportLimit[j].point1 = tmp;
      }
   }
   if (p.calcs.playerSide > 0) {
      // clipping lines that extend the player viewport limit lines
      p.calcs.clip2 = new LineSegment(p.calcs.viewportLimit[0].point1.clone(), p.calcs.viewportLimit[0].point2.clone()).extend(G.edgeOfLevel).createSquare(p.calcs.mirror ? 1 : -1).points;
      p.calcs.clip3 = new LineSegment(p.calcs.viewportLimit[1].point1.clone(), p.calcs.viewportLimit[1].point2.clone()).extend(G.edgeOfLevel).createSquare(p.calcs.mirror ? -1 : 1).points;
   }
};

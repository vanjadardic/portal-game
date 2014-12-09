'use strict';

function PortalContext() {
   this.portals = [null, null];
}

PortalContext.prototype.bothPortals = function() {
   return this.portals[0] !== null && this.portals[1] !== null;
};

PortalContext.prototype.setPortal = function(which, portalEndpoints, playerPosition) {
   var checkParrallel = function(line1, line2) {
      return Util.compareFloats(line1.a * line2.b, line2.a * line1.b) === 0;
   };
   var other = (which + 1) % 2;
   if (this.portals[other] === null) {
      var ws = whichSidePoint(portalEndpoints[0], portalEndpoints[1], playerPosition);
      return this.portals[which] = new Portal([portalEndpoints[ws > 0 ? 0 : 1], portalEndpoints[ws > 0 ? 1 : 0]], which);
   }
   var parrallel = checkParrallel(new LineSegment(this.portals[other].points[0], this.portals[other].points[1]).getLine(), new LineSegment(portalEndpoints[0], portalEndpoints[1]).getLine());
   var inRect0 = isPointInRect(this.portals[other].points[0], this.portals[other].points[1], portalEndpoints[0]);
   var inRect1 = isPointInRect(this.portals[other].points[0], this.portals[other].points[1], portalEndpoints[1]);
   var ok = !parrallel || (!inRect0 && !inRect1);
   if (ok) {
      var ws = whichSidePoint(portalEndpoints[0], portalEndpoints[1], playerPosition);
      this.portals[which] = new Portal([portalEndpoints[ws > 0 ? 0 : 1], portalEndpoints[ws > 0 ? 1 : 0]], which);
      if (this.bothPortals()) {
         this.calculatePortalsFirst();
      }
      return this.portals[which];
   }
};

PortalContext.prototype.calculatePortalsFirst = function() {
   for (var i = 0; i < 2; i++) {
      var p = this.portals[i];
      p.calcs = {};
      p.calcs.midPoint = new Point(p.points[0].x + (p.points[1].x - p.points[0].x) / 2, p.points[0].y + (p.points[1].y - p.points[0].y) / 2);
      p.calcs.alpha = Math.atan2(p.points[1].y - p.points[0].y, p.points[1].x - p.points[0].x);
   }
   for (var i = 0; i < 2; i++) {
      var p0 = this.portals[i];
      var p1 = this.portals[(i + 1) % 2];
      p0.calcs.theta = p1.calcs.alpha - p0.calcs.alpha;
      p0.calcs.theta += p0.calcs.theta <= -Math.PI ? 2 * Math.PI : (p0.calcs.theta > Math.PI ? -2 * Math.PI : 0);
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
      p0.calcs.drawAnotherPortal =
         whichSidePoint(p0.points[0], p0.points[1], p0.calcs.invPortalMatrix.transform(p0.points[0])) === 1 ||
         whichSidePoint(p0.points[0], p0.points[1], p0.calcs.invPortalMatrix.transform(p0.points[1])) === 1;
      p0.calcs.clip1 = new LineSegment(p0.calcs.invPortalMatrix.transform(p0.points[0]), p0.calcs.invPortalMatrix.transform(p0.points[1])).extend(G.edgeOfLevel).createSquare(p0.calcs.mirror ? -1 : 1).points;
   }
};

PortalContext.prototype.calculatePortal = function(which, playerPosition) {
   var p = this.portals[which];
   p.calcs.dist = distancePP(p.calcs.midPoint, playerPosition);
   p.calcs.playerSide = whichSidePoint(p.points[0], p.points[1], playerPosition);
   p.calcs.playerOnPortal = whichSidePoint(p.points[0], p.points[1], playerPosition) === 0 && isPointInRect(p.points[0], p.points[1], playerPosition) &&
      (Util.compareFloats(p.points[0].x, playerPosition.x) !== 0 || Util.compareFloats(p.points[0].y, playerPosition.y) !== 0) &&
      (Util.compareFloats(p.points[1].x, playerPosition.x) !== 0 || Util.compareFloats(p.points[1].y, playerPosition.y) !== 0);
   if (p.calcs.playerSide >= 0) {
      p.calcs.ls = [null, null];
      for (var j = 0; j < 2; j++) {
         p.calcs.ls[j] = new LineSegment(p.calcs.invPortalMatrix.transform(playerPosition), p.calcs.invPortalMatrix.transform(p.points[j]));
         if (p.calcs.ls[j].samePoints()) {
            p.calcs.ls[j] = null;
            continue;
         }
         p.calcs.ls[j].extendPoint(2, G.edgeOfLevel);
         p.calcs.ls[j].point1 = p.calcs.invPortalMatrix.transform(p.points[j]);
      }
   }
   if (p.calcs.playerSide > 0) {
      p.calcs.clip2 = new LineSegment(p.calcs.ls[0].point1.clone(), p.calcs.ls[0].point2.clone()).extend(G.edgeOfLevel).createSquare(p.calcs.mirror ? 1 : -1).points;
      p.calcs.clip3 = new LineSegment(p.calcs.ls[1].point1.clone(), p.calcs.ls[1].point2.clone()).extend(G.edgeOfLevel).createSquare(p.calcs.mirror ? -1 : 1).points;
   }
};




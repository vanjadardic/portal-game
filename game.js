'use strict';

function Portal(p, id, c) {
   this.p = p;
   this.id = id;
   this.c = c;
}

Portal.size = 2;
Portal.width = 0.2;

Portal.prototype.clone = function() {
   var p = this.p.slice(0);
   for (var i = 0; i < p.length; i++) {
      p[i] = p[i].clone();
   }
   return new Portal(p, this.id, this.c);
};

Portal.prototype.draw = function(ctx) {
   Util.drawLine(ctx, this.p, Portal.width, this.c);
};

function MapPart(p, t) {
   this.p = p;
   this.t = t;
}

MapPart.prototype.draw = function(ctx, c) {
   if (this.p.points.length < 3) {
      return;
   }
   Util.fillPolygon(ctx, this.p.points, c || this.getColor());
};

MapPart.prototype.getColor = function() {
   if (this.t === ' ') {
      return '#000';
   } else if (this.t === 'W') {
      return '#888';
   }
};

MapPart.prototype.clone = function() {
   return new MapPart(this.p.clone(), this.t);
};

function Player(x, y) {
   this.position = new Point(x, y);
   this.rotation = 0;
}

Player.prototype.draw = function(ctx) {
   var p = this.position;
   ctx.save();
   Util.transform(ctx, Matrix.createTranslationMatrix(p.x, p.y).rotate(this.rotation).translate(-p.x, -p.y));
   ctx.fillStyle = '#40ff40';
   ctx.beginPath();
   ctx.moveTo(p.x - 0.3, p.y - 0.9);
   ctx.lineTo(p.x + 0.3, p.y - 0.9);
   ctx.lineTo(p.x + 0.3, p.y + 0.3);
   ctx.lineTo(p.x, p.y + 0.9);
   ctx.lineTo(p.x - 0.3, p.y + 0.3);
   ctx.fill();



//   ctx.fillRect(p.x - 0.3, p.y - 0.9, 0.6, 1.8);
   ctx.restore();
//   ctx.beginPath();
//   ctx.arc(p.x, p.y, 35, 0, 2 * Math.PI);
//   ctx.fill();
//   ctx.beginPath();
//   ctx.moveTo(p.x - 50, p.y + 40);
//   ctx.lineTo(p.x + 50, p.y + 40);
//   ctx.arc(p.x + 50, p.y + 70, 30, 3 * Math.PI / 2, 2 * Math.PI);
//   ctx.lineTo(p.x + 80, p.y + 135);
//   ctx.arc(p.x + 65, p.y + 135, 15, 0, Math.PI);
//   ctx.lineTo(p.x + 50, p.y + 80);
//   ctx.lineTo(p.x + 40, p.y + 80);
//   ctx.lineTo(p.x + 40, p.y + 225);
//   ctx.arc(p.x + 22.5, p.y + 225, 17.5, 0, Math.PI);
//   ctx.lineTo(p.x + 5, p.y + 150);
//   ctx.lineTo(p.x - 5, p.y + 150);
//   ctx.lineTo(p.x - 5, p.y + 225);
//   ctx.arc(p.x - 22.5, p.y + 225, 17.5, 0, Math.PI);
//   ctx.lineTo(p.x - 40, p.y + 80);
//   ctx.lineTo(p.x - 50, p.y + 80);
//   ctx.lineTo(p.x - 50, p.y + 135);
//   ctx.arc(p.x - 65, p.y + 135, 15, 0, Math.PI);
//   ctx.lineTo(p.x - 80, p.y + 70);
//   ctx.arc(p.x - 50, p.y + 70, 30, Math.PI, 3 * Math.PI / 2);
//   ctx.fill();
};

function PortalContext() {
   this.portals = {b: null, y: null};
   this.colors = {b: 'blue', y: 'yellow'};
}

PortalContext.getPortalPlaceholder = function(playerPosition, mousePosition, map) {
   if (!Util.extendToEdge(playerPosition, mousePosition, G.edgeOfLevel)) {
      return false;
   }

   var ls = new LineSegment(playerPosition, mousePosition);
   var point;
   var dist = false;
   var line;
   for (var i = 0; i < map.length; i++) {
      if (map[i].t !== 'W') {
         continue;
      }
      for (var j = 0; j < map[i].p.getLineSegments().length; j++) {
         var poi = intersectLLS(ls.getLine(), map[i].p.getLineSegments()[j]);
         if (poi) {
            if (Util.compareFloats(playerPosition.x, mousePosition.x) === Util.compareFloats(playerPosition.x, poi.x) && Util.compareFloats(playerPosition.y, mousePosition.y) === Util.compareFloats(playerPosition.y, poi.y)) {
               var d = distancePP(playerPosition, poi);
               if (dist === false || d < dist) {
                  point = poi;
                  dist = d;
                  line = map[i].p.getLineSegments()[j];
               }
            }
         }
      }
   }

   var portalEndpoints;
   if (dist === false) {
      return false;
   }

   portalEndpoints = intersectCLS(new Circle(point.x, point.y, Portal.size/2), line);
   if (!portalEndpoints || portalEndpoints.length !== 2) {
      return false;
   }
   var portalLineSegment = new LineSegment(portalEndpoints[0], portalEndpoints[1]);
   L1:
      for (var i = 0; i < map.length; i++) {
      if (map[i].t !== 'W') {
         continue;
      }
      for (var j = 0; j < map[i].p.getLineSegments().length; j++) {
         if (line !== map[i].p.getLineSegments()[j]) {
            var poi = intersectLSLS(portalLineSegment, map[i].p.getLineSegments()[j]);
            if (poi !== false) {
               portalEndpoints = false;
               break L1;
            }
         }
      }
   }

   return   portalEndpoints;
};

PortalContext.prototype.bothPortals = function() {
   return this.portals['b'] !== null && this.portals['y'] !== null;
};

PortalContext.prototype.setPortal = function(which, portalEndpoints, playerPosition) {
   var checkParrallel = function(line1, line2) {
      return Util.compareFloats(line1.a * line2.b, line2.a * line1.b) === 0;
   };
   var other = which === 'b' ? 'y' : 'b';
   if (this.portals[other] === null) {
      var ws = whichSidePoint(portalEndpoints[0], portalEndpoints[1], playerPosition);
      return this.portals[which] = new Portal([portalEndpoints[ws > 0 ? 0 : 1], portalEndpoints[ws > 0 ? 1 : 0]], which, this.colors[which]);
   }
   var parrallel = checkParrallel(new LineSegment(this.portals[other].p[0], this.portals[other].p[1]).getLine(), new LineSegment(portalEndpoints[0], portalEndpoints[1]).getLine());
   var inRect0 = isPointInRect(this.portals[other].p[0], this.portals[other].p[1], portalEndpoints[0]);
   var inRect1 = isPointInRect(this.portals[other].p[0], this.portals[other].p[1], portalEndpoints[1]);
   var ok = !parrallel || (!inRect0 && !inRect1);
   if (ok) {
      var ws = whichSidePoint(portalEndpoints[0], portalEndpoints[1], playerPosition);
      this.portals[which] = new Portal([portalEndpoints[ws > 0 ? 0 : 1], portalEndpoints[ws > 0 ? 1 : 0]], which, this.colors[which]);
      if (this.bothPortals()) {
         this.calculatePortalsFirst();
      }
      return this.portals[which];
   }
};

PortalContext.prototype.calculatePortalsFirst = function() {
   for (var i = 0; i < 2; i++) {
      var p = this.portals[i === 0 ? 'b' : 'y'];
      p.calcs = {};
      p.calcs.midPoint = new Point(p.p[0].x + (p.p[1].x - p.p[0].x) / 2, p.p[0].y + (p.p[1].y - p.p[0].y) / 2);
      p.calcs.alpha = Math.atan2(p.p[1].y - p.p[0].y, p.p[1].x - p.p[0].x);
   }
   for (var i = 0; i < 2; i++) {
      var p0 = this.portals[i === 0 ? 'b' : 'y'];
      var p1 = this.portals[i === 0 ? 'y' : 'b'];
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
         whichSidePoint(p0.p[0], p0.p[1], p0.calcs.invPortalMatrix.transform(p0.p[0])) === 1 ||
         whichSidePoint(p0.p[0], p0.p[1], p0.calcs.invPortalMatrix.transform(p0.p[1])) === 1;
      p0.calcs.clip1 = new LineSegment(p0.calcs.invPortalMatrix.transform(p0.p[0]), p0.calcs.invPortalMatrix.transform(p0.p[1])).extend(G.edgeOfLevel).createSquare(p0.calcs.mirror ? -1 : 1).points;
   }
};

PortalContext.prototype.calculatePortal = function(which, playerPosition) {
   for (var i = 0; i < 2; i++) {
      var p = this.portals[which];
      p.calcs.dist = distancePP(p.calcs.midPoint, playerPosition);
      p.calcs.playerSide = whichSidePoint(p.p[0], p.p[1], playerPosition);
      p.calcs.playerOnPortal = whichSidePoint(p.p[0], p.p[1], playerPosition) === 0 && isPointInRect(p.p[0], p.p[1], playerPosition) &&
         (Util.compareFloats(p.p[0].x, playerPosition.x) !== 0 || Util.compareFloats(p.p[0].y, playerPosition.y) !== 0) &&
         (Util.compareFloats(p.p[1].x, playerPosition.x) !== 0 || Util.compareFloats(p.p[1].y, playerPosition.y) !== 0);
      if (p.calcs.playerSide >= 0) {
         p.calcs.ls = [null, null];
         for (var j = 0; j < 2; j++) {
            p.calcs.ls[j] = new LineSegment(p.calcs.invPortalMatrix.transform(playerPosition), p.calcs.invPortalMatrix.transform(p.p[j]));
            if (p.calcs.ls[j].samePoints()) {
               p.calcs.ls[j] = null;
               continue;
            }
            p.calcs.ls[j].extendPoint(2, G.edgeOfLevel);
            p.calcs.ls[j].point1 = p.calcs.invPortalMatrix.transform(p.p[j]);
         }
      }
      if (p.calcs.playerSide > 0) {
         p.calcs.clip2 = new LineSegment(p.calcs.ls[0].point1.clone(), p.calcs.ls[0].point2.clone()).extend(G.edgeOfLevel).createSquare(p.calcs.mirror ? 1 : -1).points;
         p.calcs.clip3 = new LineSegment(p.calcs.ls[1].point1.clone(), p.calcs.ls[1].point2.clone()).extend(G.edgeOfLevel).createSquare(p.calcs.mirror ? -1 : 1).points;
      }
   }
};




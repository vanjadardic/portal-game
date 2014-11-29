'use strict';

window.requestAnimFrame =
   window.requestAnimationFrame ||
   window.webkitRequestAnimationFrame ||
   window.mozRequestAnimationFrame ||
   window.msRequestAnimationFrame ||
   function(callback) {
      window.setTimeout(callback, 1000 / 60);
   };

var input = new Input('gameCanvas');

var G = {};

var pallete = [
   "#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff",
   "#800", "#080", "#008", "#880", "#808", "#088",
   "#b00", "#0b0", "#00b", "#bb0", "#b0b", "#0bb",
   "#400", "#040", "#004", "#440", "#404", "#044"];

var world;
var time;
var p2 = p2 || undefined;
var circleBody;
var rectBody;
window.onload = function() {
   G.ctx = document.getElementById("gameCanvas").getContext('2d');

   G.player = new Player(10, 10);
   G.easeAngle = null;
   G.easeScalex = null;
   G.easeScaley = null;
   //portalContext.setPortal('b', [new Point(100, 60), new Point(120, 60)], G.player.position);
   G.width = document.getElementById("gameCanvas").clientWidth;
   G.height = document.getElementById("gameCanvas").clientHeight;

   world = new p2.World({gravity: [0, -9.82]});
   var rectShape = new p2.Rectangle(20, 0.5);
   rectBody = new p2.Body({mass: 0, position: [10, 0.25]});
   rectBody.addShape(rectShape);
   var circleShape = new p2.Circle(1);
   circleBody = new p2.Body({mass: 5, position: [10, 10]});
   circleBody.addShape(circleShape);
   world.addBody(rectBody);
   world.addBody(circleBody);
   time = new Date().getTime();
   start();
};

G.map = [
   new MapPart(new Polygon([new Point(0, 0), new Point(20, 0), new Point(20, 0.5), new Point(0, 0.5)]), 'W'),
   new MapPart(new Polygon([new Point(20, 0), new Point(20, 20), new Point(19.5, 20), new Point(19.5, 0)]), 'W'),
   new MapPart(new Polygon([new Point(0, 19.5), new Point(20, 19.5), new Point(20, 20), new Point(0, 20)]), 'W'),
   new MapPart(new Polygon([new Point(0.5, 0), new Point(0.5, 20), new Point(0, 20), new Point(0, 0)]), 'W'),
   new MapPart(new Polygon([new Point(5, 0), new Point(25, 0), new Point(25, 5)]), 'W'),
   new MapPart(new Polygon([new Point(0, 10), new Point(0, 25), new Point(2, 25)]), 'W')
];

var portalContext = new PortalContext();

G.edgeOfLevel = 10000;

var drawPortalMap = function(portal, playerPosition, howMany) {
   if (howMany === 0) {
      portal.draw(G.ctx);
      return;
   }
   portalContext.calculatePortal(portal.id, playerPosition);
   var portalLines = [];
   if (portal.calcs.playerSide >= 0) {
      for (var i = 0; i < 2; i++) {
         if (portal.calcs.ls[i] !== null) {
            portalLines.push([portal.calcs.ls[i].point1, portal.calcs.ls[i].point2]);
         }
      }
   }
   var drawing = portal.calcs.playerSide > 0 || portal.calcs.playerOnPortal;
   G.ctx.save();
   Util.transform(G.ctx, portal.calcs.portalMatrix);
   G.ctx.save();
   if (drawing) {
      Util.createPath(G.ctx, portal.calcs.clip1);
      G.ctx.clip();
   }
   if (portal.calcs.playerSide > 0) {
      Util.createPath(G.ctx, portal.calcs.clip2);
      G.ctx.clip();
      Util.createPath(G.ctx, portal.calcs.clip3);
      G.ctx.clip();
   }
   if (drawing) {
      G.ctx.clearRect(-G.edgeOfLevel, -G.edgeOfLevel, G.edgeOfLevel * 2, G.edgeOfLevel * 2);
      for (var i = 0; i < G.map.length; i++) {
         G.map[i].draw(G.ctx);
      }
      if (portal.calcs.drawAnotherPortal) {
         drawPortalMap(portal, portal.calcs.invPortalMatrix.transform(playerPosition), howMany - 1);
      }
      G.player.draw(G.ctx);
   }
   G.ctx.restore();
   for (var i = 0; i < portalLines.length; i++) {
      Util.drawLine(G.ctx, [portalLines[i][0], portalLines[i][1]], Portal.width, portal.c);
   }
   G.ctx.restore();
   portal.draw(G.ctx);
};

function checkPortalPassed(p, moveSegment) {
   var poi;
   if (p.p[0].almostEquals(moveSegment.point1) || p.p[0].almostEquals(moveSegment.point2) ||
      p.p[1].almostEquals(moveSegment.point1) || p.p[1].almostEquals(moveSegment.point2) ||
      whichSidePoint(p.p[0], p.p[1], G.player.position) !== -1 ||
      !(poi = intersectLSLS(new LineSegment(p.p[0], p.p[1]), moveSegment))) {
      return;
   }

   G.player.position = p.calcs.invPortalMatrix.transform(G.player.position);
   var scaleX;
   var easeAngle = 0;
   if (!p.calcs.mirror) {
      easeAngle = Math.PI - p.calcs.theta;
      easeAngle += easeAngle <= -Math.PI ? 2 * Math.PI : (easeAngle > Math.PI ? -2 * Math.PI : 0);
   } else {
      var eax = Math.PI+p.calcs.theta + 2 * p.calcs.alpha;
      eax += eax <= -Math.PI ? 2 * Math.PI : (eax > Math.PI ? -2 * Math.PI : 0);
      var eay = p.calcs.theta + 2 * p.calcs.alpha;
      eay += eay <= -Math.PI ? 2 * Math.PI : (eay > Math.PI ? -2 * Math.PI : 0);
      scaleX = Math.abs(eax) <= Math.abs(eay);
      easeAngle = scaleX ? eax : eay;
   }

   var animDuration = 500;
   if (Util.compareFloats(easeAngle, 0) !== 0) {
      G.easeAngle = new EaseOutExpo(easeAngle, 0, animDuration);
      G.easeAngle.start();
   }

   if (p.calcs.mirror) {
      if (scaleX) {
         G.easeScalex = new EaseOutExpo(-1, 1, animDuration);
         G.easeScalex.start();
      } else {
         G.easeScaley = new EaseOutExpo(-1, 1, animDuration);
         G.easeScaley.start();
      }
   }
}

function start() {
   G.ctx.save();
   G.ctx.clearRect(-G.edgeOfLevel, -G.edgeOfLevel, 2 * G.edgeOfLevel, 2 * G.edgeOfLevel);
   //G.ctx.fillRect(-10, -10, 660, 420, '#000');

   var moveSegment = new LineSegment(G.player.position.clone(), null);
   if (G.easeAngle === null && G.easeScalex === null && G.easeScaley === null) {


      var speed = 0.1;
      if (input.isLeft()) {
         G.player.position.x -= speed;
      }
      if (input.isRight()) {
         G.player.position.x += speed;
      }
      if (input.isUp()) {
         G.player.position.y += speed;
      }
      if (input.isDown()) {
         G.player.position.y -= speed;
      }
      moveSegment.point2 = G.player.position.clone();
   }

   if (portalContext.bothPortals() && moveSegment.point2 !== null && !moveSegment.samePoints()) {
      checkPortalPassed(portalContext.portals['b'], moveSegment);
      checkPortalPassed(portalContext.portals['y'], moveSegment);
   }

   var enlarge = 10;
   var mousePos = new Point(input.mouse.x / enlarge + G.player.position.x - G.width / enlarge / 2, input.mouse.y / enlarge * -1 + G.player.position.y - G.height / enlarge / 2 * -1);
//   if (Math.random() < 0.02) {
//      console.log(mousePos);
//   }


   if (G.easeAngle === null && G.easeScalex === null && G.easeScaley === null) {
      var portalEndpoints = PortalContext.getPortalPlaceholder(G.player.position.clone(), mousePos.clone(), G.map);
      if (portalEndpoints) {
         if (input.isMBLeft()) {

            portalContext.setPortal('b', portalEndpoints, G.player.position);

         }
         if (input.isMBRight()) {
            portalContext.setPortal('y', portalEndpoints, G.player.position);

         }
      }
   }

   var angle = 0;
   if (G.easeAngle !== null) {
      angle = G.easeAngle.getValue();
      if (G.easeAngle.isFinished()) {
         G.easeAngle = null;
      }
   }
   var scalex = 1;
   if (G.easeScalex !== null) {
      scalex = G.easeScalex.getValue();
      if (G.easeScalex.isFinished()) {
         G.easeScalex = null;
      }
   }
   var scaley = 1;
   if (G.easeScaley !== null) {
      scaley = G.easeScaley.getValue();
      if (G.easeScaley.isFinished()) {
         G.easeScaley = null;
      }
   }

   Util.setTransform(G.ctx, Matrix.createTranslationMatrix(G.width / 2, G.height / 2).rotate(angle).scale(scalex * enlarge, -scaley * enlarge).translate(-G.player.position.x, -G.player.position.y));
   for (var i = 0; i < G.map.length; i++) {
      G.map[i].draw(G.ctx);
   }

   G.player.rotation = -angle;

   if (portalContext.bothPortals()) {
      var howMany = 4;
      portalContext.calculatePortal('b', G.player.position);
      portalContext.calculatePortal('y', G.player.position);
      if (portalContext.portals['b'].calcs.dist < portalContext.portals['y'].calcs.dist) {
         drawPortalMap(portalContext.portals['y'], G.player.position, howMany);
         drawPortalMap(portalContext.portals['b'], G.player.position, howMany);
      } else {
         drawPortalMap(portalContext.portals['b'], G.player.position, howMany);
         drawPortalMap(portalContext.portals['y'], G.player.position, howMany);
      }
   } else {
      if (portalContext.portals['b'])
         portalContext.portals['b'].draw(G.ctx);
      if (portalContext.portals['y'])
         portalContext.portals['y'].draw(G.ctx);
   }

   if (portalEndpoints) {
      var prt = new Portal(portalEndpoints, null, '#fff');
      prt.draw(G.ctx);
   }
   if (G.easeAngle === null && G.easeScalex === null && G.easeScaley === null) {
      Util.fillRect(G.ctx, mousePos.x - 0.1, mousePos.y - 0.1, 0.2, 0.2, '#f0f');
   }


   Util.setTransform(G.ctx, Matrix.createTranslationMatrix(G.width / 2, G.height / 2).scale(enlarge, -enlarge).translate(-G.player.position.x, -G.player.position.y));

   //Util.setTransform(G.ctx, Matrix.createTranslationMatrix(G.width/2 - G.player.position.x, G.height/2 - G.player.position.y));
   G.player.rotation = 0;
   G.player.draw(G.ctx);

   input.resetMouseButtons();




   var newTime = new Date().getTime();
   world.step((newTime - time) / 1000);
   time = newTime;

   G.ctx.beginPath();
   G.ctx.arc(circleBody.position[0], circleBody.position[1], 1, 0, 2 * Math.PI);
   G.ctx.fillStyle = '#fff';
   G.ctx.fill();

   if (Math.random() < 0.05) {



      //console.log("Circle y position: " + circleBody.position[1]);
      //console.log("rect: " + rectBody.position[1]);
   }
   G.ctx.restore();
   requestAnimFrame(start);
}


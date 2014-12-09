'use strict';

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


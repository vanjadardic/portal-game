'use strict';

/**
 * @param {Number} x
 * @param {Number} y
 * @constructor
 */
function Player(x, y) {
   this.position = new Point(x, y);
   this.rotation = 0;
   this.color = '#40ff40';
}

/**
 * Draws the {@link Player} on the canvas.
 * @param ctx
 */
Player.prototype.draw = function(ctx) {
   var p = this.position;
   ctx.save();
   Util.transform(ctx, Matrix.createTranslationMatrix(p.x, p.y).rotate(this.rotation).translate(-p.x, -p.y));
   Util.fillPolygon(ctx, [
      new Point(p.x - 0.3, p.y - 0.9),
      new Point(p.x + 0.3, p.y - 0.9),
      new Point(p.x + 0.3, p.y + 0.3),
      new Point(p.x, p.y + 0.9),
      new Point(p.x - 0.3, p.y + 0.3)
   ], this.color);
   ctx.restore();
};


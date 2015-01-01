'use strict';

/**
 * @class Circle represented with x and y coordinates, and radius r.
 * @param {Number} x The x coordinate.
 * @param {Number} y The y coordinate.
 * @param {Number} r The radius.
 */
function Circle(x, y, r) {
   /** 
    * The x coordinate. 
    * @type {Number} 
    * */
   this.x = x;
   /** 
    * The y coordinate. 
    * @type {Number} 
    * */
   this.y = y;
   /** 
    * The radius. 
    * @type {Number} 
    * */
   this.r = r;
}

/**
 * @returns {Circle}
 */
Circle.prototype.clone = function() {
   return new Circle(this.x, this.y, this.r);
};

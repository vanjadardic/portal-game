'use strict';

/**
 * @class Class for monitoring keyboard and mouse input states.
 * @param {String} canvasId
 */
function Input(canvasId) {
   var me = this;
   me.keys = {};
   me.mouse = {};
   document.addEventListener('keydown', function(e) {
      me.keys[e.keyCode] = true;
   }, true);
   document.addEventListener('keyup', function(e) {
      me.keys[e.keyCode] = false;
   }, true);
   window.addEventListener('contextmenu', function(e) {
      e.preventDefault();
   }, true);
   document.addEventListener('mousedown', function(e) {
      me.mouse[e.which] = true;
   }, true);
   document.addEventListener('mouseup', function(e) {
      me.mouse[e.which] = false;
   }, true);
   me.canvasOffset = {x: 0, y: 0};
   me.mouse = {x: 0, y: 0};
   window.addEventListener('load', function() {
      var canvas = document.getElementById(canvasId);
      me.canvasOffset.x = canvas.offsetLeft + canvas.clientLeft;
      me.canvasOffset.y = canvas.offsetTop + canvas.clientTop;
   }, true);
   document.addEventListener('mousemove', function(e) {
      me.mouse.x = e.pageX - me.canvasOffset.x;
      me.mouse.y = e.pageY - me.canvasOffset.y;
   }, true);
}

/**
 * Controls for the game.
 */
Input.codes = {
   UP: 87, ///// W
   LEFT: 65, /// A
   DOWN: 83, /// S
   RIGHT: 68, // D
   FIRE1: 1, /// left mouse
   FIRE2: 3 //// right mouse
};

/**
 * @param {Boolean} [reset]
 * @returns {Boolean}
 */
Input.prototype.isUp = function(reset) {
   var val = !!this.keys[Input.codes.UP];
   if (reset) {
      this.keys[Input.codes.UP] = false;
   }
   return val;
};

/**
 * @param {Boolean} [reset]
 * @returns {Boolean}
 */
Input.prototype.isLeft = function(reset) {
   var val = !!this.keys[Input.codes.LEFT];
   if (reset) {
      this.keys[Input.codes.LEFT] = false;
   }
   return val;
};

/**
 * @param {Boolean} [reset]
 * @returns {Boolean}
 */
Input.prototype.isDown = function(reset) {
   var val = !!this.keys[Input.codes.DOWN];
   if (reset) {
      this.keys[Input.codes.DOWN] = false;
   }
   return val;
};

/**
 * @param {Boolean} [reset]
 * @returns {Boolean}
 */
Input.prototype.isRight = function(reset) {
   var val = !!this.keys[Input.codes.RIGHT];
   if (reset) {
      this.keys[Input.codes.RIGHT] = false;
   }
   return val;
};

/**
 * @param {Boolean} [reset]
 * @returns {Boolean}
 */
Input.prototype.isFire1 = function(reset) {
   var val = !!this.mouse[Input.codes.FIRE1];
   if (reset) {
      this.mouse[Input.codes.FIRE1] = false;
   }
   return val;
};

/**
 * @param {Boolean} [reset]
 * @returns {Boolean}
 */
Input.prototype.isFire2 = function(reset) {
   var val = !!this.mouse[Input.codes.FIRE2];
   if (reset) {
      this.mouse[Input.codes.FIRE2] = false;
   }
   return val;
};
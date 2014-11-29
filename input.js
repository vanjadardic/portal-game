'use strict';

function Input(canvasId) {
   var me = this;
   me.resetKeys();
   document.addEventListener('keydown', function(e) {
      me.pressedK[e.keyCode] = true;
   }, true);
   document.addEventListener('keyup', function(e) {
      me.pressedK[e.keyCode] = false;
   }, true);
   me.resetMouseButtons();
   window.addEventListener('contextmenu', function(e) {
      e.preventDefault();
   }, true);
   document.addEventListener('mousedown', function(e) {
      me.pressedM[e.which] = true;
   }, true);
   document.addEventListener('mouseup', function(e) {
      me.pressedM[e.which] = false;
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

Input.keyCodes = {
   W: 87,
   A: 65,
   S: 83,
   D: 68
};

Input.prototype.isUp = function() {
   return !!this.pressedK[Input.keyCodes.W];
};

Input.prototype.isLeft = function() {
   return !!this.pressedK[Input.keyCodes.A];
};

Input.prototype.isDown = function() {
   return !!this.pressedK[Input.keyCodes.S];
};

Input.prototype.isRight = function() {
   return !!this.pressedK[Input.keyCodes.D];
};

Input.prototype.resetKeys = function() {
   this.pressedK = {};
};

Input.prototype.isMBLeft = function() {
   return !!this.pressedM[1];
};

Input.prototype.isMBRight = function() {
   return !!this.pressedM[3];
};

Input.prototype.resetMouseButtons = function() {
   this.pressedM = {};
};

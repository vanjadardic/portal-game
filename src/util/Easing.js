'use strict';

/**
 * @class Changes the value from offset to offset + length in accordance to the {@link Easing.fnc|easing function}.
 * @param {function} [fnc=Easing.fnc.easeInExpo] Easing function to use. Should be a function from {@link Easing.fnc}.
 * @param {Number} [offset=0] Starting value for easing.
 * @param {Number} [length=100] Length of the easing. The final value will be offset + length.
 * @param {Number} [duration=500] Duration of the easing.
 */
function Easing(fnc, offset, length, duration) {
   this.fnc = fnc === undefined ? Easing.default.fnc : fnc;
   this.offset = offset === undefined ? Easing.default.offset : offset;
   this.length = length === undefined ? Easing.default.length : length;
   this.duration = duration === undefined ? Easing.default.duration : duration;
}

/**
 * Easing functions to be used in constructor of {@link Easing}.
 */
Easing.fnc = {
   easeInExpo: function(t, d) {
      return Math.pow(2, 10 * (t / d - 1));
   },
   easeOutExpo: function(t, d) {
      return 1 - Math.pow(2, -10 * t / d);
   },
   easeInOutExpo: function(t, d) {
      return ((t *= 2) < d ? Easing.fnc.easeInExpo(t, d) : (1 + Easing.fnc.easeOutExpo(t - d, d))) / 2;
   },
   easeOutInExpo: function(t, d) {
      return ((t *= 2) < d ? Easing.fnc.easeOutExpo(t, d) : (1 + Easing.fnc.easeInExpo(t - d, d))) / 2;
   }
};

/**
 * Defaults for the {@link Easing}.
 */
Easing.default = {
   fnc: Easing.fnc.easeInExpo,
   offset: 0,
   length: 100,
   duration: 500
};

/**
 * Starts the easing. If the easing is already in progress, then it restarts it.
 */
Easing.prototype.start = function() {
   this.startTime = new Date().getTime();
   this.completed = false;
};

/**
 * Checks if the easing is complete.
 * @returns {boolean}
 */
Easing.prototype.isComplete = function() {
   return this.completed || (this.completed = ((new Date().getTime() - this.startTime) >= this.duration));
};

/**
 * Calculates the current value of the easing. If the easing is complete, then it returns offset + length without calculating anything.
 * @returns {Number}
 */
Easing.prototype.getValue = function() {
   if (this.completed) {
      return this.offset + this.length;
   }
   var time = new Date().getTime() - this.startTime;
   if (time >= this.duration) {
      this.completed = true;
      return this.offset + this.length;
   } else {
      return this.offset + this.length * this.fnc(time, this.duration);
   }
};

'use strict';

function EaseOutExpo(v1, v2, duration, startX, lengthX) {
   this.v1 = v1;
   this.v2 = v2;
   this.vDiff = v2 - v1;
   this.duration = duration || 500;
   this.startX = startX || 1;
   this.lengthX = lengthX || 10;
   this.lengthY = Math.log(this.startX + this.lengthX) - Math.log(this.startX);
}

EaseOutExpo.prototype.start = function() {
   this.startTime = new Date();
   this.value = this.v1;
};

EaseOutExpo.prototype.isFinished = function() {
   return this.finished || (this.finished = new Date().getTime() - this.startTime.getTime() >= this.duration);
};

EaseOutExpo.prototype.getValue = function() {
   var elapsed = new Date().getTime() - this.startTime.getTime();
   if (elapsed >= this.duration) {
      this.finished = true;
      return this.v2;
   }
   return this.v1 + this.vDiff * Math.log(this.startX + elapsed / this.duration * this.lengthX) / this.lengthY;
};

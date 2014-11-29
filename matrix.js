'use strict';

/**
 * Creates a new matrix.
 * 
 * @class A 3x3 matrix.
 * @param {Number[][]} coef
 * @returns {Matrix}
 */
function Matrix(coef) {
   /** The coefficients of the matrix. @type {Number[][]} */
   this.coef = coef || [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
   ];
}

Matrix.createIdentityMatrix = function() {
   return new Matrix([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
   ]);
};

Matrix.createTranslationMatrix = function(x, y) {
   return new Matrix([
      [1, 0, x],
      [0, 1, y],
      [0, 0, 1]
   ]);
};

Matrix.createRotationMatrix = function(theta) {
   var cosTheta = Math.cos(theta), sinTheta = Math.sin(theta);
   return new Matrix([
      [cosTheta, sinTheta, 0],
      [-sinTheta, cosTheta, 0],
      [0, 0, 1]
   ]);
};

Matrix.createScalingMatrix = function(sx, sy) {
   return new Matrix([
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1]
   ]);
};

Matrix.prototype.multiply = function(otherMatrix) {
   var newMatrix = new Matrix(), i, j;
   for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
         newMatrix.coef[i][j] =
            this.coef[i][0] * otherMatrix.coef[0][j] +
            this.coef[i][1] * otherMatrix.coef[1][j] +
            this.coef[i][2] * otherMatrix.coef[2][j];
      }
   }
   return newMatrix;
};

Matrix.prototype.translate = function(x, y) {
   return this.multiply(Matrix.createTranslationMatrix(x, y));
};

Matrix.prototype.rotate = function(theta) {
   return this.multiply(Matrix.createRotationMatrix(theta));
};

Matrix.prototype.scale = function(sx, sy) {
   return this.multiply(Matrix.createScalingMatrix(sx, sy));
};

Matrix.prototype.transform = function(point) {
   return new Point(
      this.coef[0][0] * point.x + this.coef[0][1] * point.y + this.coef[0][2],
      this.coef[1][0] * point.x + this.coef[1][1] * point.y + this.coef[1][2]);
};

Matrix.prototype.clone = function() {
   var newMatrix = new Matrix(), i, j;
   for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
         newMatrix.coef[i][j] = this.coef[i][j];
      }
   }
   return newMatrix;
};

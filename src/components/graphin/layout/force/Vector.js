/**
 * 向量运算 Youtube教程：https://www.youtube.com/watch?v=Kti2mNKDOTw&list=PLA9470D64579500CE&index=6
 *
 * 向量有3个容易混淆概念
 * scalar Multip 系数积
 * dot Product 内积/点积
 * cross product 外积/有向积
 */
class Vector {
  constructor (x, y) {
    this.getvec = () => {
      return this
    }
    this.add = (v2) => {
      return new Vector(this.x + v2.x, this.y + v2.y)
    }
    this.subtract = (v2) => {
      return new Vector(this.x - v2.x, this.y - v2.y)
    }
    this.magnitude = () => {
      return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    this.normalise = () => {
      return this.divide(this.magnitude())
    }
    this.divide = (n) => {
      return new Vector(this.x / n || 0, this.y / n || 0)
    }
    this.scalarMultip = (n) => {
      return new Vector(this.x * n, this.y * n)
    }
    this.x = x
    this.y = y
  }
}

export default Vector

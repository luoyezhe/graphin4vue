import Vector from './Vector'

class Point {
  constructor (position, id, data, mass = 1.0) {
    this.updateAcc = (force) => {
      /**
       * 加速度也是一个向量，根据力的平行四边形法则进行力的合成，用向量运算就是加运算
       */
      this.a = this.a.add(force.divide(this.m)) // a = a + F/m
    }
    this.p = position // 点的位置，用[x,y]向量来表示
    this.m = mass // 点的质量，默认为1.0
    this.v = new Vector(0, 0) // 速度，初始值为向量零 [0,0] velocity, init with x=0, y=0
    this.a = new Vector(0, 0) // 加速度，初始值为向量零 [0,0] acceleration, init with x=0, y=0
    this.id = id // 点的唯一ID  id of Point, defaults to -1
    this.data = data
  }
}

export default Point

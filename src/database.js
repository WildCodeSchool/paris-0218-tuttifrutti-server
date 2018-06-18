const mongoose = require('mongoose')
const server = 'mongodb://root:root@ds233320.mlab.com:33320/tutti-frutti'

class Database {
  constructor () {
    this._connect()
  }
  _connect () {
    mongoose.connect(`${server}`)
      .then(() => {
        console.log('Database connection successful')
      })
      .catch(err => {
        console.error('Database connection error')
        console.log(err)
      })
  }
}

module.exports = new Database()

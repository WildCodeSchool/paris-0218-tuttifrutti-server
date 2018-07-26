const mongoose = require('mongoose')
const mongodbUri = process.env.MONGODB_URI || 'mongodb://root@localhost/tutti-frutti'

class Database {
  constructor () {
    this._connect()
  }

  _connect () {
    mongoose.connect(`${mongodbUri}`)
      .then(() => {
        console.log(`Database connection successful - '${mongodbUri}'`)
      })
      .catch(err => {
        console.error('Database connection error')
        console.log(err)
      })
  }
}

module.exports = new Database()

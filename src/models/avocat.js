const mongoose = require('mongoose')
// const bcrypt = require('bcrypt')

let avocatSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  cabinet: {
    type: String
  },
  phone: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  zipCode: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  toque: {
    type: String
  },
  field: {
    type: String,
    required: true
  }
})

// hashing a password before saving it to the database
  // => transféré sur le fichier des routes


// avocatSchema.pre('save', function (next) {
//   console.log('test')
//   let avocat = this
//   bcrypt.hash(avocat.password, 16, function (err, hash) {
//     if (err) {
//       return next(err)
//     }
//     avocat.password = hash
//     next()
//   })
// })

module.exports = mongoose.model('Avocat', avocatSchema)

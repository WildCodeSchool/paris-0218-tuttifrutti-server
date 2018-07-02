const mongoose = require('mongoose')
// const bcrypt = require('bcrypt')

let studentSchema = new mongoose.Schema({

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
  phone: {
    type: Number,
    required: true
  },
  levelStudy: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  }
})

// hashing a password before saving it to the database
// studentSchema.pre('save', function (next) {
//   let student = this
//   bcrypt.hash(student.password, 16, function (err, hash) {
//     if (err) {
//       return next(err)
//     }
//     student.password = hash
//     next()
//   })
// })

module.exports = mongoose.model('Student', studentSchema)

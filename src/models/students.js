const mongoose = require('mongoose')
// const validator = require('validator')
const bcrypt = require('bcrypt')

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
  toque: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  }
})

// hashing a password before saving it to the database
studentSchema.pre('save', function (next) {
  let student = this
  bcrypt.hash(student.password, 16, function (err, hash) {
    if (err) {
      return next(err)
    }
    student.password = hash
    next()
  })
})

module.exports = mongoose.model('Avocat', studentSchema)

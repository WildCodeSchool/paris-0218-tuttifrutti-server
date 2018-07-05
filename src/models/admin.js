const mongoose = require('mongoose')

let adminSchema = new mongoose.Schema({
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
  activated: {
    type: Boolean,
    required: true
  }
})


module.exports = mongoose.model('Admin', adminSchema)

const mongoose = require('mongoose')

let missionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String
  },
  student: {
    type: String
  }
})

module.exports = mongoose.model('Mission', missionSchema)

const mongoose = require('mongoose')
const validator = require('validator')

let avocatSchema = new mongoose.Schema({
    // id: Number,
    email : {
      type: String,
      required: true,
      unique: true,
      lowercase: true,},
    password: {
      type: String,
      required: true,},
    firstName: {
      type: String,
      required: true,},
    lastName: {
      type: String,
      required: true,},
    cabinet: {
      type: String,
      required: true,},
    phone: {
      type: Number,
      required: true,},
    address: {
      type: String,
      required: true,},
    zipCode: {
      type: Number,
      required: true,},
    toque: {
      type: String,
      required: true,},
    field: {
      type: String,
      required: true,}
  })

  module.exports = mongoose.model('Avocat', avocatSchema)

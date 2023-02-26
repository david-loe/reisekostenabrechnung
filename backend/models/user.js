const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true, index: true },
  email: { type: String },
  name: { type: String },
  access: {
    examine: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
    admin: { type: Boolean, default: false }
  },
  settings: {
    language: {type: String, default: 'de'},
    currency: {type: String, default: 'EUR'},
  }
})

userSchema.pre(/^find((?!Update).)*$/, function () {
  this.populate({ path: 'settings' })
  this.populate({ path: 'access' })
})

module.exports = mongoose.model('User', userSchema)
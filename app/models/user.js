const {Schema, model} = require('mongoose')

const user = new Schema({
  userId: {
    type: String,
    required: true
  }
})

module.exports = model('User', user)
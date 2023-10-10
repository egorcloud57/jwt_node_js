const {Schema, model} = require('mongoose')

const token = new Schema({
  tokenId: {
    type: String,
  },
  userId: {
    type: String
  }
})

module.exports = model('Token', token)
// require mongoose ODM
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  type: {
    type: String
  },
  platform: {
    type: String
  },
  ranks: {
    duel: String,
    doubles: String,
    standard: String,
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('User', UserSchema)
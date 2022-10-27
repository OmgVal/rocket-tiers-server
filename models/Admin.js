// require mongoose ODM
const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String
  },
  image: {
    type: String
  },
  tournaments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Admin', AdminSchema)
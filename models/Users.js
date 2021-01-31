const mongoose = require('mongoose')

const UsersSchema = new mongoose.Schema({
  username: String,
})

const Users = new mongoose.model('user', UsersSchema)

module.exports = Users

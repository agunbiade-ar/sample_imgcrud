const mongoose = require('mongoose')

const user_schema = new mongoose.Schema({
    name: {type: String},
    avatar: {type: String},
    cloudinary_id: {type: String}
})

module.exports = mongoose.model('User', user_schema)
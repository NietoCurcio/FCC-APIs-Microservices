const mongoose = require('mongoose')

const ExercisesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  date: Date,
  duration: Number,
  description: String,
})

const Exercises = new mongoose.model('exercise', ExercisesSchema)

module.exports = Exercises

const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const Users = require('./models/Users')
const Exercises = require('./models/Exercises')
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json());
// old way

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
  console.log('MongoDB Connected...')
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// only strings or arrays, extended true was outmached by JSON
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.post('/api/exercise/new-user', (req, res) => {
  const username = req.body.username
  const user = new Users({ username })
  user.save((err, result) => {
    if (err) return res.json({ error: err.messages })
    res.json(result)
  })
})

app.post('/api/exercise/add', (req, res) => {
  const userId = req.body.userId
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date

  Users.findById(userId, (err, userResult) => {
    if (err) return res.json({ error: err.messages })
    if (!userResult) res.send('Unkown userId')
    const exercise = new Exercises({
      user: userResult._id,
      date: new Date(date),
      duration,
      description,
    })
    exercise.save((err, result) => {
      if (err) return res.json({ error: err.messages })
      res.json({
        _id: userResult._id,
        username: userResult.username,
        date: result.date.toDateString(),
        duration: result.duration,
        description: result.description,
      })
    })
  })
})

app.get('/api/exercise/log', (req, res) => {
  // log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many
  // logs to send back.
  const userId = req.query.userId
  const from = new Date(req.query.from)
  const to = new Date(req.query.to)
  const limit = req.query.limit

  if (!userId) return res.send('Unkown userId')

  Users.findById(userId, (err, userResult) => {
    if (!userResult) return res.send('Unkown userId')
    const username = userResult.username

    let findExerciseChain
    if (req.query.from && req.query.to) {
      findExerciseChain = Exercises.find({
        user: userId,
        date: { $gte: new Date(from), $lte: new Date(to) },
      })
    } else {
      findExerciseChain = Exercises.find({
        user: userId,
      })
    }

    if (limit) {
      findExerciseChain.limit(Number.parseInt(limit))
    }

    findExerciseChain.exec((err, result) => {
      const count = result.length
      const log = result.map((item) => {
        return {
          description: item.description,
          duration: item.duration,
          date: item.date.toDateString(),
        }
      })
      res.json({ _id: userId, username, count, log })
    })
  })
})

app.get('/api/exercise/users', (req, res) => {
  Users.find().exec((err, result) => {
    if (err) res.json({ error: err.messages })
    const response = result.map((item) => ({
      _id: item._id,
      username: item.username,
    }))
    res.json(response)
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

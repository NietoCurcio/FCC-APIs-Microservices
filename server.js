var express = require('express')
var cors = require('cors')
var multer = require('multer')
var path = require('path')
require('dotenv').config()

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'))
  },
  filename: function (req, file, cb) {
    console.log(file)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extension = file.mimetype === 'image/png' ? '.png' : ''
    cb(null, file.originalname + uniqueSuffix + extension)
  },
})
var upload = multer({ storage: storage })

var app = express()

app.use(cors())
app.use('/public', express.static(process.cwd() + '/public'))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

app.get('/teste', (req, res) => {
  res.header({ 'Content-Type': 'multipart/form-data' })
  // res.header({ 'Content-Type': 'image/png' }) // show the image
  res.sendFile(
    path.join(
      __dirname,
      'public',
      'uploads',
      'jsLogo2.png1612139765955-114154640.png'
    )
  )
})

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  res.send({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  })
})

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
})

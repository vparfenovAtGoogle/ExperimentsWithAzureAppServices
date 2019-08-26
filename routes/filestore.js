const express = require('express') // https://expressjs.com/en/4x/api.html#express
const router = express.Router()
const multer  = require('multer') // https://github.com/expressjs/multer
const fs = require('fs')

const uploadDir = 'uploads'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log (`Storage destination: ${JSON.stringify (req)}`)
    fs.access (uploadDir, err => {
      if (err) {
        console.log (`Creating upload directory: ${uploadDir}`)
        fs.mkdirSync (uploadDir, {recursive: true})
      }
      console.log (`Returning upload directory: ${uploadDir}`)
      console.log (`Stat: ${JSON.stringify (fs.statSync (uploadDir))}`)
      cb(null, uploadDir)
    })
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

function fileFilter (req, file, cb) {

  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  cb(null, false)

  // To accept the file pass `true`, like so:
  cb(null, true)

  // You can always pass an error if something goes wrong:
  cb(new Error('I don\'t have a clue!'))

}

//var storage = multer.memoryStorage()
//var upload = multer({ storage: storage })

//var upload = multer({ storage: storage, fileFilter: fileFilter })
var upload = multer({ storage })

//var upload = multer({ dest: 'uploads' })

function logRequestAndSendResponse (req, res) {
  const query = req.query 
  console.log(`query: ${JSON.stringify (query)}, path: ${req.path}, path: ${req.method}, url: ${req.url}`)
  if (req.body) console.log(`req.body=${JSON.stringify (req.body)}`)
  if (req.files) console.log(`req.files=${JSON.stringify (req.files)}`)
  if (req.headers) console.log(`req.headers=${JSON.stringify (req.headers)}`)
  res.json({query, files: req.files, headers: req.headers})
}

router.post('/', upload.any(), function(req, res, next) {
  logRequestAndSendResponse (req, res)
})

router.post('/memory', multer({ storage: multer.memoryStorage() }).any(), function(req, res, next) {
  if (req.files) {
    req.files.forEach (f => {
      if (f.buffer) {
        delete f.buffer
      }
    })
  }
  res.json({query: req.query, files: req.files, headers: req.headers})
})


router.post('/string', multer({ storage: multer.memoryStorage() }).any(), function(req, res, next) {
  if (req.files) {
    req.files.forEach (f => {
      if (f.buffer) {
        f.string = f.buffer.toString ()
        delete f.buffer
      }
    })
  }
  logRequestAndSendResponse (req, res)
})

router.post('/json', multer({ storage: multer.memoryStorage() }).any(), function(req, res, next) {
  if (req.files) {
    req.files.forEach (f => {
      if (f.buffer) {
        f.json = JSON.parse (f.buffer.toString ())
        delete f.buffer
      }
    })
  }
  logRequestAndSendResponse (req, res)
})

router.get('/', function(req, res, next) {
  const query = req.query 
  console.log(`query: ${JSON.stringify (query)}, path: ${req.path}, path: ${req.method}, url: ${req.url}`)
  if (req.body) console.log(`req.body=${JSON.stringify (req.body)}`)
  if (req.files) console.log(`req.files=${JSON.stringify (req.files)}`)
  if (req.headers) console.log(`req.headers=${JSON.stringify (req.headers)}`)
  fs.readdir('uploads', (err, files) => {
    if (err) {
      res.json({query, error: err})
    }
    else if (files.length > 0) {
      const file = files [0]
      res.download(`uploads/${file}`, file, function (err) {
        if (err) {
          console.log(`error while download ${err}`)
          res.json({query, error: err})
        } else {
          // decrement a download credit, etc.
          console.log(`successful download`)
        }
      })
    }
    else {
      res.json({query, error: 'files not found'})
    }
  })
  //res.send(JSON.stringify (result));
})

module.exports = router
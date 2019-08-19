var express = require('express') // https://expressjs.com/en/4x/api.html#express
var router = express.Router()
var multer  = require('multer') // https://github.com/expressjs/multer

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
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

var upload = multer({ dest: 'uploads/' })

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
  res.download('uploads/log.txt', 'log.txt', function (err) {
    if (err) {
      console.log(`error while download ${err}`)
    } else {
      // decrement a download credit, etc.
      console.log(`successful download`)
    }
  })
  //res.send(JSON.stringify (result));
})

module.exports = router
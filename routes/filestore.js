const express = require('express') // https://expressjs.com/en/4x/api.html#express
const router = express.Router()
const multer  = require('multer') // https://github.com/expressjs/multer
const fs = require('fs')
const path = require('path')

const uploadDir = 'uploads'

function createDir (dir, cb) {
  fs.access (dir, err => {
    if (err) {
      fs.mkdir (dir, {recursive: true}, err => {
        cb (err, dir)
      })
    }
    else {
      cb(err, dir)
    }
  })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    createDir (uploadDir, (err, dir) => cb (err, dir))
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname)
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

router.use('/list', function(req, res, next) { 
  res.setHeader('Last-Modified', (new Date()).toUTCString());
  next(); 
})

router.get('/list', function(req, res, next) {
  const dir = req.query.dir || uploadDir
  fs.readdir(dir, (err, files) => {
    if (err) {
      res.render('list',
      {
        title: 'Directory is missing',
        files: []
      })
    }
    else {
      res.render('list',
      {
        title: `Content of ${dir}`,
        files: files.map (f => {
          const stat = fs.statSync(path.join (dir, f))
          return {name: f, ctime: new Date (stat.birthtime).toLocaleString (), mtime: new Date (stat.mtime).toLocaleString (), size: stat.size}
        })
      })
    }
  })
})

router.use('/memory', function(req, res, next) {
  req.uploaddir = req.query.appdir
  req.args = (typeof req.query.args === 'string') ? JSON.parse (req.query.args) : req.query.args
  if (!req.uploaddir && req.args) req.uploaddir = req.args.appdir
  if (!req.uploaddir) req.uploaddir = uploadDir
  next(); 
})

router.post('/memory', multer({ storage: multer.memoryStorage() }).any(), function(req, res, next) {
  if (req.files && req.files.length > 0) {
    const appDir = req.uploaddir
    var dones = 0
    const nfiles = req.files.length
    function done (err) {
      if (err) {
        res.json({query: req.query, files: req.files, headers: req.headers, error: err})
      }
      else if (++dones == nfiles) {
        res.json({query: req.query, files: req.files, headers: req.headers})
      }
    }
    req.files.forEach (f => {
      if (f.buffer) {
        const buffer = f.buffer
        createDir (appDir, (err, dir) => {
          if (err) {
            f.error = err
            done (err)
          }
          else {
            const filepath = path.join (dir, `${f.fieldname}`)
            fs.writeFile (filepath, buffer, err => {
              if (err) {
                f.error = err
              }
              else {
                f.saved = true
                f.savedName = filepath
              }
              done ()
            })
          }
        })
        delete f.buffer
      }
    })
  }
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
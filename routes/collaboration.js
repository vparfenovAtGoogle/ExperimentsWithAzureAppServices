const sessionDb = require ('./session') ()
const queryProcessor = require ('./queryprocessor').create (sessionDb)

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const query = req.query 
  console.log(`query: ${JSON.stringify (query)}, path: ${req.path}, path: ${req.method}, url: ${req.url}`)
  res.send(`query: ${JSON.stringify (query)}, path: ${req.path}, path: ${req.method}, url: ${req.url}`);
  //res.send(JSON.stringify (result));
})

module.exports = router
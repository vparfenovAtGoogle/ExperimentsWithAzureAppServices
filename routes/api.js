const express = require('express');

module.exports = function (applicationObj) {
  const router = express.Router()
  const handler = function(req, res, next) {
    const query = req.query 
    console.log(`query: ${JSON.stringify (query)}, path: ${req.pqth}, path: ${req.method}, url: ${req.url}`)
    if (Object.keys (query).length > 0) {
      let result = null
      try {
        let func = applicationObj [query.func]
        if (typeof func === 'function') {
            func = func.bind (applicationObj)
        }
        else {
            throw `${func} does not exist`
        }
        const args = query.args
        result = {result: args ? func (...JSON.parse (args)) : func ()}
      }
      catch (ex) {
        result = {exception: `${ex}`}
      }
      res.json(result)
    }
  }
  router.use('/', function(req, res, next) { 
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next(); 
  })
  router.get('/', handler)
  router.post('/', handler)
  return router
}

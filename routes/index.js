const login = require('./login')
const express = require('express')
const router = express.Router()

const people = [
  {lastName: 'Goubanov', firstName: 'Rodion', state: 'warning'},
  {lastName: 'Apraj', firstName: 'Shashikant', state: 'info'},
  {lastName: 'Dementiev', firstName: 'Daniel', state: 'danger'},
  {lastName: 'Parfenov', firstName: 'Vladimir', state: 'success'}
]

/* GET home page. */

const renderHomePage = function(req, res, next) {
  res.render('index',
    {
      title: 'Test Node.JS with AAD Authentication',
      people
    })
}

router.get('/', login)

module.exports = router;

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const fileRouter = require('./routes/filestore');
const authRouter = require ('./routes/auth')
//const colaborationRouter = require('./routes/collaboration');

require ('./creojs/ptc-creo-js').bootstrap (`${__dirname}/public/creojsweb`)

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//console.log(`static path: ${path.join(__dirname, 'public')}`)

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/files', fileRouter);
app.use('/auth', authRouter);
//app.use('/collaboration', colaborationRouter);

const sessionDb = require ('./session') ()
const apiRouter = require ('./routes/api') (sessionDb)
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

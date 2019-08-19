const os = require ('os')
const uuidv1 = require ('uuid/v1')
const queryProcessor = require ('./queryprocessor')

function pushToArray (obj, arr) {arr.push (obj); return obj}

class Model {
  constructor (name, features) {
    this.name = name
    this.features = features
    this.modificationCount = 0
  }
  toJSON () {
    return {name: this.name, featureCount: this.features.length}
  }
}

class Participant {
  constructor (username) {
    this.username = username
    const THIS = this
    if (false) http.query (`http://baltika/names?username=${username}`, data => {
      THIS.firstName = data.firstName
      THIS.lastName = data.lastName
      THIS.email = data.email
    })
  }
  toJSON () {
    return {username: this.username, firstName: this.firstName, lastName: this.lastName, email: this.email}
  }
}

class ClientSession {
  constructor (id, user) {
    this.id = id
    this.user = user
  }
  toJSON () {
    return {id: this.id, username: this.user.username}
  }
}

class SharedSession {
  constructor (name, id) {
    this.name = name
    this.id = id
    this.notifications = []
    this.clientSessions = []
    this.models = []
  }
  addModel (name) {
    return pushToArray (new Model (name, []), this.models)
  }
  addClientSession (username) {
    return pushToArray (new Participant (Participant), this.participants)
  }
  toJSON () {
    return {id: this.id, name: this.name}
  }
}

class SessionDB {
  constructor () {
    this.sharedSessions = []
    this.clientSessions = []
    this.users = []
    this.messages = []
    this.idCount = 0
    this.uuid = uuidv1 ()
    this.processor = queryProcessor (this)
  }
  newId () {
    const length = 6
    const value = this.idCount++
    const suffux = '0'.repeat (length) + value.toString(16)
    return `${this.uuid}-${suffux.slice (suffux.length-length)}`
  }
  createClientSession (username) {
    return pushToArray (new ClientSession (this.newId (), this.addUser (username)), this.clientSessions)
  }
  closeClientSession (id) {
    return true // TODO
  }
  listClientSessions () {
    return this.clientSessions
  }
  createSharedSession (name) {
    return pushToArray (new SharedSession (name, this.newId ()), this.sharedSessions)
  }
  closeSharedSession (id) {
    return true // TODO
  }
  saveMessage (msg) {
    this.messages.push (msg)
    return msg // TODO
  }
  listSharedSessions () {
    return this.sharedSessions
  }
  addUser (username) {
    let user = this.users.find (user => user.username === username)
    return user || pushToArray (new Participant (username), this.users)
  }
  getPI () {return Math.PI}
  getE () {return Math.E}
  getSum (...args) {
    let sum = 0
    args.forEach (v=>sum+=v)
    return sum
  }
  executeQuery (query) {
    return this.processor.execute (query)
  }
  getEnv () {
    return process.env
  }
  getOS () {
    return {
      hostname: os.hostname(),
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus(),
      networkInterfaces: os.networkInterfaces()
    }
  }
  toJSON () {
    return {
      clientSessionsCount: this.clientSessions.length,
      sharedSessionsCount: this.sharedSessions.length,
      usersCount: this.users.length,
      idCount: this.idCount,
      uuid: this.uuid
    }
  }
}

module.exports = function () {return new SessionDB ()}

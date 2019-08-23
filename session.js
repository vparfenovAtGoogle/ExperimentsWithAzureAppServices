const os = require ('os')
const uuidv1 = require ('uuid/v1')
const request = require ('request')

const KeyVaultClient = require('./keyvaultclient');

const queryProcessor = require ('./queryprocessor')

const KeyVault = require('azure-keyvault');
const msRestAzure = require('ms-rest-azure');

let keyVaultClient = null
const vaultUri = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net/`

function getKeyVaultCredentials () {
  return msRestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'})
}

function getKeyVaultToken (credentials) {
  return new Promise ((resolve, reject) => {
    credentials.getToken ((err, tokenResponse) => {
      if (err) {
        reject(err);
      }
      else {
        resolve (tokenResponse.tokenType + ' ' + tokenResponse.accessToken)
      }
    })
  })
}

function getKeyVaultClient () {
  return getKeyVaultCredentials ()
    .then (credentials => getKeyVaultToken (credentials))
    .then (token => new KeyVault.KeyVaultClient(new KeyVault.KeyVaultCredentials((challenge, callback) => callback (null, token))))
}

function getKeyVaultSecretOld (name) {
  if (keyVaultClient) {
   return keyVaultClient.getSecret(vaultUri, name, "")
  }
  return getKeyVaultClient ().then (client => keyVaultClient = client).then (client => getKeyVaultSecret (name))
}

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
  testPromise (delay=2000) {
    const start = new Date ()
    const args = Array.from (arguments)
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve({bar:'foo', PI: Math.PI, start, stop: new Date(), args});
      }, delay);
    }).then (r=>r)
  }
  getCredentials () {return getKeyVaultCredentials ()} 
  getCredentialsInfo () {
    return getKeyVaultCredentials ()
      .then (credentials => {
        return {credentials, features: Object.keys (credentials).map (name => `${name}: ${typeof credentials [name]}`)}
      })
  } 
  parseSecretId (id) {return KeyVaultClient.parseSecretId (id)} 
  getKeyVault () {return getKeyVaultClient ()} 
  getSecret (name) {
    return new KeyVaultClient (process.env.KEY_VAULT_NAME).getSecret (name)
  }
  setSecret (name, value) {
    return new KeyVaultClient (process.env.KEY_VAULT_NAME).setSecret (name, value)
  }
  getSecrets () {
    return new KeyVaultClient (process.env.KEY_VAULT_NAME).getSecrets ()
  }
  getInstanceMetadata () {
    return new Promise ((resolve, reject) => {
      request ({
        url: 'http://169.254.169.254/metadata/instance?api-version=2019-03-11',
        json: true,
        headers: {Metadata: 'true'}
      }, (err, res, data) => {
        if (err) {
          reject (err)
        }
        else if (res.statusCode !== 200) {
          reject (new Error (`Getting instance metadata returned ${res.statusCode}`))
        }
        else {
          resolve (data)
        }
      })
    })
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

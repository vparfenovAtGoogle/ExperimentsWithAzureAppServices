const AzureKeyVault = require('azure-keyvault');
const msRestAzure = require('ms-rest-azure');

let keyVaultClient = null
let tokenResponse = null

function getKeyVaultCredentials () {
  return msRestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'})
}

function getKeyVaultToken (credentials) {
  return new Promise ((resolve, reject) => {
    credentials.getToken ((err, response) => {
      if (err) {
        tokenResponse = null
        reject(err);
      }
      else {
        tokenResponse = response
        resolve (tokenResponse.tokenType + ' ' + tokenResponse.accessToken)
      }
    })
  })
}

function refreshKeyVaultClient () {
  return getKeyVaultCredentials ()
    .then (credentials => getKeyVaultToken (credentials))
    .then (token => new AzureKeyVault.KeyVaultClient(new AzureKeyVault.KeyVaultCredentials((challenge, callback) => callback (null, token))))
}

function getKeyVaultClient () {
  if (keyVaultClient) {
    return Promise.resolve (keyVaultClient)
  }
  return refreshKeyVaultClient ().then (client => keyVaultClient = client)
}

function getKeyVaultSecret (vaultUri, name) {
  return getKeyVaultClient ().then (client=>client.getSecret(vaultUri, name, ""))
}

class KeyVault
{
  constructor (name) {
    this.uri = `https://${name}.vault.azure.net/`
  }
  static getAccessToken () {
    if (tokenResponse) {
      return Promise.resolve (tokenResponse)
    }
    return refreshKeyVaultClient ().then (()=>tokenResponse)
  }
  getSecret (name) {
    return getKeyVaultSecret (this.uri, name)
  }
  setSecret (name, value) {
  }
  listSecrets () {
  }
}

module.exports = KeyVault
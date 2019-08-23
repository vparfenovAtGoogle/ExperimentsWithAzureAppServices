const AzureKeyVault = require('azure-keyvault');
const msRestAzure = require('ms-rest-azure');

const now = () => new Date ().getTime ()

let keyVaultClient = null
let tokenExpiration = now ()

function getKeyVaultCredentials () {
  return msRestAzure.loginWithAppServiceMSI({resource: 'https://vault.azure.net'})
}

function getKeyVaultToken (credentials) {
  return new Promise ((resolve, reject) => {
    credentials.getToken ((err, tokenResponse) => {
      if (err) {
        tokenExpiration = now ()
        reject (err);
      }
      else {
        tokenExpiration = new Date (tokenResponse.expiresOn).getTime ()
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
  if (keyVaultClient && ((now () + 60000) < tokenExpiration)) {
    return Promise.resolve (keyVaultClient)
  }
  keyVaultClient = null
  return refreshKeyVaultClient ().then (client => keyVaultClient = client)
}

class KeyVault
{
  constructor (name) {
    this.uri = `https://${name}.vault.azure.net/`
  }
  getSecret (name) {
    return getKeyVaultClient ().then (client=>client.getSecret(this.uri, name, ""))
  }
  setSecret (name, value, options) {
    return getKeyVaultClient ().then (client=>client.setSecret(this.uri, name, value, options))
  }
  listSecrets () {
    return getKeyVaultClient ().then (client=>client.getSecrets(this.uri))
  }
}

module.exports = KeyVault
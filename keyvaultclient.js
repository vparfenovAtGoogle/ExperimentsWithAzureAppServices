const AzureKeyVault = require('azure-keyvault');
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
    .then (token => new AzureKeyVault.KeyVaultClient(new AzureKeyVault.KeyVaultCredentials((challenge, callback) => callback (null, token))))
}

function getKeyVaultSecret (vaultUri, name) {
  if (keyVaultClient) {
   return keyVaultClient.getSecret(vaultUri, name, "")
  }
  return getKeyVaultClient ().then (client => keyVaultClient = client).then (client => getKeyVaultSecret (name))
}

class KeyVault
{
  constructor (name) {
    this.uri = `https://${name}.vault.azure.net/`
  }
  getSecret (name) {
    return getKeyVaultSecret (this.uri, name)
  }
}

module.exports = KeyVault
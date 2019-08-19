const express = require('express')

const router = express.Router()
router.get('/login', (req, res) => {  
  res.render('login', {
    layout: 'loginlayout',
    title: "Login with one of the following Identity Providers",
    idps: [
      {type: 'aad', name: 'Azure AD'}
    ]
  })
})
router.get('/debug', (req, res) => {  
  let headers = req.headers
  const claims = []
  function collectClaims (token) {
    try {
      const decoded = JSON.parse (Buffer.from(token, 'base64').toString('binary'))
      if (decoded.claims) {
        decoded.claims.map (claim => {claims.push ({type: claim.typ, value: claim.val}) })
      }
    }
    catch (err) {
      // ignore
      claims.push ({type: 'Error', value: err})
    }
  }
  const x_ms_client_principal = headers ['x-ms-client-principal']
  claims.push ({type: 'x_ms_client_principal', value: x_ms_client_principal})
  if (x_ms_client_principal) {
    collectClaims (x_ms_client_principal)
  }
  else {
    claims.push ({type: 'Debug message', value: `'x-ms-client-principal' is missing`, style: "font-weight:bold;color:red"})
    //collectClaims ('eyJhdXRoX3R5cCI6ImFhZCIsImNsYWltcyI6W3sidHlwIjoiYXVkIiwidmFsIjoiYTM2ODkzNmEtMDk3Mi00ODBhLWJmMTktOGY0NmFlNjE1ZjcwIn0seyJ0eXAiOiJpc3MiLCJ2YWwiOiJodHRwczpcL1wvc3RzLndpbmRvd3MubmV0XC8zMWM5NDExYy03MzkxLTRmOGYtYWUxMS00ZTQyOWYxYmUyZGRcLyJ9LHsidHlwIjoiaWF0IiwidmFsIjoiMTU2NTE4MDA2MSJ9LHsidHlwIjoibmJmIiwidmFsIjoiMTU2NTE4MDA2MSJ9LHsidHlwIjoiZXhwIiwidmFsIjoiMTU2NTE4Mzk2MSJ9LHsidHlwIjoiYWlvIiwidmFsIjoiQVdRQW1cLzhNQUFBQVRZSEFGZHZFN0M1SFwvMFFhaHEyVWZOOHpcL2lpR0dVYit2ZXhZWTV4Q01ZSVg1VUcwdlJcL1JEcjdMRVUxNjZuUlFBdWhodzZwc2h0QUp4RDdHaHo3TmJiK1I3U1BvYTN3eTJ5MGtnRDZUUzJmM3FDRWxJVEVpUzdPdGJRYytLWVFqIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL2NsYWltc1wvYXV0aG5tZXRob2RzcmVmZXJlbmNlcyIsInZhbCI6InB3ZCJ9LHsidHlwIjoiY19oYXNoIiwidmFsIjoiOWY5WFpOZ3RrSXFmYkdTaUNYOEViQSJ9LHsidHlwIjoiaHR0cDpcL1wvc2NoZW1hcy54bWxzb2FwLm9yZ1wvd3NcLzIwMDVcLzA1XC9pZGVudGl0eVwvY2xhaW1zXC9lbWFpbGFkZHJlc3MiLCJ2YWwiOiJ2cGFyZmVub3ZAcHRjLmNvbSJ9LHsidHlwIjoiaHR0cDpcL1wvc2NoZW1hcy5taWNyb3NvZnQuY29tXC9pZGVudGl0eVwvY2xhaW1zXC9pZGVudGl0eXByb3ZpZGVyIiwidmFsIjoiaHR0cHM6XC9cL3N0cy53aW5kb3dzLm5ldFwvYjk5MjEwODYtZmY3Ny00ZDBkLTgyOGEtY2IzMzgxZjY3OGUyXC8ifSx7InR5cCI6ImluX2NvcnAiLCJ2YWwiOiJ0cnVlIn0seyJ0eXAiOiJpcGFkZHIiLCJ2YWwiOiI5Ni4yMzcuMjMyLjk3In0seyJ0eXAiOiJuYW1lIiwidmFsIjoiUGFyZmVub3YsIFZsYWRpbWlyIn0seyJ0eXAiOiJub25jZSIsInZhbCI6IjY5ZDk5OGY4YWQxNzQ5MDhiOGRlNmNmNjNjNjc1YWRkXzIwMTkwODA3MTIyNDIxIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL2lkZW50aXR5XC9jbGFpbXNcL29iamVjdGlkZW50aWZpZXIiLCJ2YWwiOiJiMjk2NjQyYi02ZGVhLTQ3OWQtYWFjMC1hYjRmZGY3MTY0YjQifSx7InR5cCI6Imh0dHA6XC9cL3NjaGVtYXMueG1sc29hcC5vcmdcL3dzXC8yMDA1XC8wNVwvaWRlbnRpdHlcL2NsYWltc1wvbmFtZWlkZW50aWZpZXIiLCJ2YWwiOiJNNzVoN2Y4dlpfNm5CZUhpVnRvejE3dFJ4WUhGN2xfcnlyaVVsOF85OG00In0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL2lkZW50aXR5XC9jbGFpbXNcL3RlbmFudGlkIiwidmFsIjoiMzFjOTQxMWMtNzM5MS00ZjhmLWFlMTEtNGU0MjlmMWJlMmRkIn0seyJ0eXAiOiJodHRwOlwvXC9zY2hlbWFzLnhtbHNvYXAub3JnXC93c1wvMjAwNVwvMDVcL2lkZW50aXR5XC9jbGFpbXNcL25hbWUiLCJ2YWwiOiJ2cGFyZmVub3ZAcHRjLmNvbSJ9LHsidHlwIjoidXRpIiwidmFsIjoieEd6TmFZemNQa2l3RDJNb2o4aTNBQSJ9LHsidHlwIjoidmVyIiwidmFsIjoiMS4wIn1dLCJuYW1lX3R5cCI6Imh0dHA6XC9cL3NjaGVtYXMueG1sc29hcC5vcmdcL3dzXC8yMDA1XC8wNVwvaWRlbnRpdHlcL2NsYWltc1wvZW1haWxhZGRyZXNzIiwicm9sZV90eXAiOiJodHRwOlwvXC9zY2hlbWFzLm1pY3Jvc29mdC5jb21cL3dzXC8yMDA4XC8wNlwvaWRlbnRpdHlcL2NsYWltc1wvcm9sZSJ9')
  }
  headers = Object.keys (headers).map (key => {
    return {key, value: headers [key]}
  })
  res.render('debug',
    {
      title: 'Test Node.JS with AAD Authentication environment',
      headers,
      claims
    })
})
router.get('/logout', (req, res) => {
  // handle with passport
  res.send('logging out')
})
router.get('/google', (req, res) => {
  // handle with passport
  res.send('logging in with Google')
})

module.exports = router
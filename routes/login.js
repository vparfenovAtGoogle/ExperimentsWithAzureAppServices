module.exports = function(req, res, next) {
  res.render('login', {
    layout: 'loginlayout',
    title: "Login with one of the following Identity Providers",
    idps: [
      {type: 'aad', name: 'Azure AD', help: 'aad'},
      {type: 'microsoftaccount', name: 'Microsoft Account', help: 'microsoft'},
      {type: 'facebook', name: 'Facebook', todo: true, help: 'facebook'},
      {type: 'google', name: 'Google', help: 'google'},
      {type: 'twitter', name: 'Twitter', todo: true, help: 'twitter'}
    ]
  })
}

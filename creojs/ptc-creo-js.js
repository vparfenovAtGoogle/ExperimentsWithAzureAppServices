const fs = require('fs')

function copyFile (src, dst) {
  fs.copyFile(src, dst, (err) => {
    if (err) throw err;
    console.log(`${src} was copied to ${dst}`);
  })
}

function copyDir (src, dst) {
  fs.access (dst, err => {
    if (err) fs.mkdirSync (dst, {recursive: true})
    fs.readdir(src, (err, files) => {
      files.forEach(file => {
        const srcfile = `${src}/${file}`
        const dstfile = `${dst}/${file}`
        fs.stat (srcfile, (err, stats) => {
          if (err) throw err
          if (stats.isDirectory ()) {
            copyDir (srcfile, dstfile)
          }
          else {
            copyFile (srcfile, dstfile)
          }
        })
      });
    })
  })
}

module.exports.bootstrap = dst => {
  console.log (`copy ${__dirname} to ${dst}`)
  copyDir (`${__dirname}/www`, dst)
}
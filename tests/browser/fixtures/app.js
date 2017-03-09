const spawn = require('child_process').spawn
const path = require('path')

module.exports = () => {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'watch:server:test'], {
      cwd: path.resolve(path.join(__dirname, '../../../')),
      env: process.env
    })
    proc.stdout.on('data', (data) => {
      data = data.toString('utf8').trim()

      console.log(`[SERVER stdout]: ${data}`)

      if (data.includes('App running at:')) {
        resolve({
          stop: () => {
            return new Promise((resolve, reject) => {
              proc.on('close', resolve)
              proc.kill()
            })
          }
        })
      }
    })
    proc.stderr.on('data', (data) => {
      console.log(`[SERVER stderr]: ${data.toString('utf8').trim()}`)
    })
    proc.on('error', (error) => reject(error))
  })
}

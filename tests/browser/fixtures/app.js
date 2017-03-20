const spawn = require('child_process').spawn
const path = require('path')

const resetApp = () => {
  if (!process.env.RESET_APP) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('meteor', ['reset'], {
      cwd: path.resolve(path.join(__dirname, '../../../')),
      env: process.env
    })
    proc.on('exit', () => {
      resolve()
    })
    proc.on('error', (error) => reject(error))
  })
}

const startApp = () => {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'watch:server:test'], {
      cwd: path.resolve(path.join(__dirname, '../../../')),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    })
    proc.stdout.on('data', (data) => {
      data = data.toString('utf8').trim()

      console.info(`[SERVER stdout]: ${data}`)

      if (data.includes('App running at:')) {
        resolve({
          stop: () => {
            return new Promise((resolve, reject) => {
              proc.on('exit', () => {
                resolve()
              })
              proc.on('error', (error) => {
                reject(error)
              })

              proc.stdout.destroy()
              proc.stderr.destroy()
              proc.kill()
            })
          }
        })
      }
    })
    proc.stderr.on('data', (data) => {
      data = data.toString('utf8').trim()

      console.error(`[SERVER stderr]: ${data}`)
    })
    proc.on('error', (error) => reject(error))
  })
}

module.exports = () => {
  return resetApp()
  .then(() => startApp())
}

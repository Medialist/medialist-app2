
exports.command = function createDomain (types, callback) {
  const output = []

  this.perform((done) => {
    types.forEach((type, index) => {
      const method = `create${type.substring(0, 1).toUpperCase()}${type.substring(1)}`

      if (!this[method]) {
        throw new Error(`Unknown domain object type ${type}`)
      }

      // null out the index so we can wait for an array full of non-null values
      output[index] = null

      this[method](domain => {
        output[index] = domain

        if (output.filter(entry => entry === null).length) {
          // still some nulls in the array so we are still waiting on some domain objects
          return
        }

        // we have populated all requested domain types
        output.push(done)
        callback.apply(null, output)
      })
    })
  })

  return this
}

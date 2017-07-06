'use strict'

exports.assertion = function (actual, expected) {
  this.expected = expected
  this.message = 'The contacts were equal'
  this.value = function (result) {
    return result
  }
  this.command = function (callback) {
    callback(actual)

    return this
  }

  const self = this

  this.pass = function (actual) {
    if (expected.name !== actual.name) {
      self.message = `Contact names did not match. Expected '${expected.name}', got '${actual.name}'`

      return false
    }

    const listProperties = ['outlets', 'emails', 'phones', 'socials']

    for (var i = 0; i < listProperties.length; i++) {
      const property = listProperties[i]

      if (expected[property].length !== actual[property].length) {
        self.message = `Contacts did not have the same number of ${property}. Expected '${expected[property].length}', got '${actual[property].length}'`

        return false
      }

      for (var j = 0; j < expected[property].length; j++) {
        if (expected[property][j].label !== actual[property][j].label) {
          self.message = `Contact ${property} ${j} label did not match. Expected '${expected[property][j].label}', got '${actual[property][j].label}'`

          return false
        }

        if (expected[property][j].value !== actual[property][j].value) {
          self.message = `Contact ${property} ${j} value did not match. Expected '${expected[property][j].value}', got '${actual[property][j].value}'`

          return false
        }
      }
    }

    for (let k = 0; k < expected.addresses.length; k++) {
      const address = expected.addresses[k]

      const notSame = Object.keys(address).some(function (field) {
        return expected.addresses[k][field] !== actual.addresses[k][field]
      })

      if (notSame) return false
    }

    return true
  }
}


// Left here as an artifact to intruige the code spelunker.  This should work
// but causes the test to hang even if the assertion passes.

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

    return true
  }
}

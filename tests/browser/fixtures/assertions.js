
const campaignsAreEqual = (t, actual, expected) => {
  t.assert.equal(actual.name, expected.name, `Campaign names did not match. Expected '${expected.name}', got '${actual.name}'`)
  t.assert.equal(actual.client ? actual.client.name : actual.clientName, expected.client ? expected.client.name : expected.clientName, `Campaign client did not match. Expected '${expected.client ? expected.client.name : expected.clientName}', got '${actual.client ? actual.client.name : actual.clientName}'`)
  t.assert.equal(actual.purpose, expected.purpose, `Campaign purpose did not match. Expected '${expected.purpose}', got '${actual.purpose}'`)
  t.assert.equal(actual.links.length, expected.links.length, `Campaigns did not have the same number of links. Expected '${expected.links.length}', got '${actual.links.length}'`)

  expected.links.forEach((link, index) => {
    t.assert.equal(link.url, actual.links[index].url, `Campaign links did not match. Expected '${expected.links[index].url}', got '${actual.links[index].url}'`)
  })
}

const contactsAreEqual = (t, actual, expected) => {
  t.assert.equal(actual.name, expected.name, `Contact names did not match. Expected '${expected.name}', got '${actual.name}'`)

  const listProperties = ['outlets', 'emails', 'phones', 'socials']

  listProperties.forEach(property => {
    t.assert.equal(actual[property].length, expected[property].length, `Contacts did not have the same number of ${property}. Expected '${expected[property].length}', got '${actual[property].length}'`)

    expected[property].forEach((job, index) => {
      t.assert.equal(actual[property][index].label, expected[property][index].label, `Contact ${property} ${index} label did not match. Expected '${expected[property][index].label}', got '${actual[property][index].label}'`)
      t.assert.equal(actual[property][index].value, expected[property][index].value, `Contact ${property} ${index} value did not match. Expected '${expected[property][index].value}', got '${actual[property][index].value}'`)
    })
  })
}

module.exports = {
  campaignsAreEqual,
  contactsAreEqual
}


const campaignsAreEqual = (t, expected, actual) => {
  t.assert.equal(expected.name, actual.name, `Campaign names did not match. Expected '${expected.name}', got '${actual.name}'`)
  t.assert.equal(expected.client.name, actual.clientName, `Campaign client did not match. Expected '${expected.client.name}', got '${actual.clientName}'`)
  t.assert.equal(expected.purpose, actual.purpose, `Campaign purpose did not match. Expected '${expected.purpose}', got '${actual.purpose}'`)
  t.assert.equal(expected.links.length, actual.links.length, `Campaigns did not have the same number of links. Expected '${expected.links.length}', got '${actual.links.length}'`)

  expected.links.forEach((link, index) => {
    t.assert.equal(link.url, actual.links[index].url, `Campaign links did not match. Expected '${expected.links[index].url}', got '${actual.links[index].url}'`)
  })
}

const contactsAreEqual = (t, expected, actual) => {
  t.assert.equal(expected.name, actual.name, `Contact names did not match. Expected '${expected.name}', got '${actual.name}'`)

  const listProperties = ['outlets', 'emails', 'phones', 'socials']

  listProperties.forEach(property => {
    t.assert.equal(expected[property].length, actual[property].length, `Contacts did not have the same number of ${property}. Expected '${expected[property].length}', got '${actual[property].length}'`)

    expected[property].forEach((job, index) => {
      t.assert.equal(expected[property][index].label, actual[property][index].label, `Contact ${property} ${index} label did not match. Expected '${expected[property][index].label}', got '${actual[property][index].label}'`)
      t.assert.equal(expected[property][index].value, actual[property][index].value, `Contact ${property} ${index} value did not match. Expected '${expected[property][index].value}', got '${actual[property][index].value}'`)
    })
  })
}

module.exports = {
  campaignsAreEqual,
  contactsAreEqual
}

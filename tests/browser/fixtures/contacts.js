const faker = require('faker')

const createContact = () => {
  return {
    name: faker.name.findName(),
    outlets: [{
      title: faker.name.jobTitle(),
      company: faker.company.companyName()
    }, {
      title: faker.name.jobTitle(),
      company: faker.company.companyName()
    }],
    emails: [faker.internet.email(), faker.internet.email()],
    phones: [faker.phone.phoneNumber(), faker.phone.phoneNumber()],
    socials: {
      website: faker.internet.url(),
      twitter: faker.internet.userName(),
      linkedin: faker.internet.userName(),
      facebook: faker.internet.userName(),
      youtube: faker.internet.userName(),
      instagram: faker.internet.userName(),
      medium: faker.internet.userName(),
      pinterest: faker.internet.userName(),
      otherWebsite: faker.internet.url()
    }
  }
}

const verifyContactsAreEqual = (t, contact, other) => {
  t.assert.equal(other.name, contact.name)

  t.assert.equal(other.outlets.length, contact.outlets.length)

  other.outlets.forEach((outlet, index) => {
    t.assert.equal(outlet.label, contact.outlets[index].company)
    t.assert.equal(outlet.value, contact.outlets[index].title)
  })

  const listProperties = ['emails', 'phones']

  listProperties.forEach(property => {
    t.assert.equal(other[property].length, contact[property].length)

    contact[property].forEach((job, index) => {
      t.assert.equal(other[property][index].value, contact[property][index])
    })
  })

  Object.keys(contact.socials).forEach((social, index) => {
    t.assert.equal(other.socials[index].value, contact.socials[social])
  })
}

module.exports = {
  createContact: createContact,
  verifyContactsAreEqual: verifyContactsAreEqual
}

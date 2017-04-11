const faker = require('faker')

function labelValue (label, value) {
  return {
    label,
    value
  }
}

function campaign () {
  return {
    name: faker.company.catchPhrase(),
    clientName: faker.company.companyName(),
    purpose: faker.hacker.phrase(),
    links: [{
      url: faker.internet.url()
    }, {
      url: faker.internet.url()
    }, {
      url: faker.internet.url()
    }]
  }
}

function contact () {
  return {
    name: faker.name.findName(),
    outlets: [
      labelValue(faker.company.companyName(), faker.name.jobTitle()),
      labelValue(faker.company.companyName(), faker.name.jobTitle())
    ],
    emails: [
      labelValue('Email', faker.internet.email()),
      labelValue('Email', faker.internet.email())
    ],
    phones: [
      labelValue('Phone', faker.phone.phoneNumber()),
      labelValue('Phone', faker.phone.phoneNumber())
    ],
    socials: [
      labelValue('Website', faker.internet.url()),
      labelValue('Twitter', faker.internet.userName()),
      labelValue('LinkedIn', faker.internet.userName()),
      labelValue('Facebook', faker.internet.userName()),
      labelValue('YouTube', faker.internet.userName()),
      labelValue('Instagram', faker.internet.userName()),
      labelValue('Medium', faker.internet.userName()),
      labelValue('Pinterest', faker.internet.userName()),
      labelValue('Website', faker.internet.url())
    ]
  }
}

function user () {
  return {
    emails: [{
      address: faker.internet.email(null, null, 'test.medialist.io')
    }],
    profile: {
      name: faker.name.findName(),
      avatar: faker.image.imageUrl()
    }
  }
}

module.exports = {
  campaign,
  contact,
  user,
  labelValue
}

'use strict'

const editContactForm = require('../forms/edit-contact-form')
const contactTable = require('../forms/contact-table')

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    newContactButton: '[data-id=new-contact-button]'
  },
  sections: {
    editContactForm: editContactForm,
    contactTable: contactTable
  },
  commands: [{

  }]
}

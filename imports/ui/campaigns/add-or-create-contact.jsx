import React from 'react'
import PropTypes from 'prop-types'
import AddContact from './add-contact'
import { CreateContactModal } from '/imports/ui/contacts/edit-contact'

class AddOrCreateContact extends React.Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    campaignContacts: PropTypes.array.isRequired,
    selectedContacts: PropTypes.array.isRequired,
    allContactsCount: PropTypes.number.isRequired,
    addContact: PropTypes.func.isRequired,
    removeContact: PropTypes.func.isRequired,
    clearContacts: PropTypes.func.isRequired
  }

  state = {
    term: '',
    activeModal: this.props.allContactsCount > 0 ? 'add' : 'create'
  }

  onTermChange = (term) => {
    this.setState({term})
  }

  onDismissAddModal = () => {
    this.setState({
      term: ''
    })
    this.props.clearContacts()
    this.props.onDismiss()
  }

  onDismissCreateModal = () => {
    this.setState({
      activeModal: 'add'
    })
  }

  onCreateNew = () => {
    this.setState({
      activeModal: 'create'
    })
  }

  onContactCreated = (slug, details) => {
    this.setState({
      activeModal: 'add',
      term: ''
    })
    this.props.addContact({
      slug: slug,
      ...details
    })
  }

  onCancelCreateNew = () => {
    this.setState({
      activeModal: 'add'
    })
  }

  render () {
    const {open, campaign, campaignContacts, selectedContacts, addContact, removeContact, clearContacts} = this.props
    const {term, activeModal} = this.state
    return (
      <div>
        <AddContact
          open={open && activeModal === 'add'}
          term={term}
          campaign={campaign}
          campaignContacts={campaignContacts}
          selectedContacts={selectedContacts}
          onDismiss={this.onDismissAddModal}
          onCreate={this.onCreateNew}
          onTermChange={this.onTermChange}
          onAddContact={addContact}
          onRemoveContact={removeContact}
          onClearContacts={clearContacts}
        />
        <CreateContactModal
          open={open && activeModal === 'create'}
          onDismiss={this.onDismissCreateModal}
          onContactCreated={this.onContactCreated}
          onCancel={this.onCancelCreateNew}
          prefill={{name: term}}
        />
      </div>
    )
  }
}

const withSelectedContacts = (Component) => {
  return class SelectedContactsContainer extends React.Component {
    state = {
      selectedContacts: []
    }

    addContact = (contact) => {
      this.setState({
        selectedContacts: this.state.selectedContacts.concat(contact)
      })
    }

    removeContact = (contact) => {
      this.setState({
        selectedContacts: this.state.selectedContacts.filter((c) => c.slug !== contact.slug)
      })
    }

    clearContacts = () => {
      this.setState({ selectedContacts: [] })
    }

    render () {
      return <Component
        {...this.props}
        selectedContacts={this.state.selectedContacts}
        addContact={this.addContact}
        removeContact={this.removeContact}
        clearContacts={this.clearContacts}
      />
    }
  }
}

export default withSelectedContacts(AddOrCreateContact)

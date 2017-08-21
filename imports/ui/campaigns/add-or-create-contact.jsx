import React from 'react'
import PropTypes from 'prop-types'
import AddContact from './add-contact'
import { CreateContactModal } from '/imports/ui/contacts/edit-contact'

class AddOrCreateContact extends React.Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    campaign: PropTypes.object.isRequired,
    campaignContacts: PropTypes.array.isRequired
  }

  state = {
    term: '',
    activeModal: 'add'
  }

  onTermChange = (term) => {
    this.setState({term})
  }

  onDismissAddModal = () => {
    this.setState({
      term: ''
    })
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

  onContactCreated = (slug) => {
    this.setState({
      activeModal: 'add'
    })
  }

  onCancelCreateNew = () => {
    this.setState({
      activeModal: 'add'
    })
  }

  render () {
    const {open, campaign, campaignContacts} = this.props
    const {term, activeModal} = this.state
    return (
      <div>
        <AddContact
          open={open && activeModal === 'add'}
          term={term}
          campaign={campaign}
          campaignContacts={campaignContacts}
          onDismiss={this.onDismissAddModal}
          onCreate={this.onCreateNew}
          onTermChange={this.onTermChange} />
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

export default AddOrCreateContact

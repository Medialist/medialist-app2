import { Meteor } from 'meteor/meteor'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import deepEqual from 'deep-equal'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import Checkbox from '/imports/ui/tables/checkbox'
import Radio from '/imports/ui/tables/radio'

class MergeContacts extends React.Component {
  static propTypes = {
    contacts: PropTypes.array.isRequired,
    uniqueNames: PropTypes.array.isRequired,
    uniqueOutlets: PropTypes.array.isRequired,
    hasConflicts: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onMerged: PropTypes.func.isRequired,
    toggleOutlet: PropTypes.func.isRequired,
    onChangeName: PropTypes.func.isRequired
  }

  render () {
    const {
      contacts,
      uniqueNames,
      uniqueOutlets,
      selectedOutlets,
      hasConflicts,
      onDismiss,
      onSubmit,
      toggleOutlet,
      onChangeName
    } = this.props

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center mt6'>Merge these Contacts</div>
        <div className='mb6'>
          <AbbreviatedAvatarList items={contacts} maxTooltip={12} total={contacts.length} />
        </div>
        {hasConflicts && (
          <div className='border-top border-gray80 px7 pt3 pb6'>
            <label className='block gray20 f-md pt4 mb2'>
              {`You are merging ${contacts.length} contacts. Select the information you want to keep`}
            </label>
            <label className='block gray20 f-md pt4 pb2'>Name</label>
            {uniqueNames.map(name =>
              <div className='pb2' key={name}>
                <Radio
                  name='name'
                  checked={name === this.props.name}
                  onChange={() => onChangeName(name)}
                  label={name} />
              </div>
            )}
            {uniqueOutlets.length > 0 ? (
              <div>
                <label className='block gray20 f-md pt4 pb2'>Jobs</label>
                {uniqueOutlets.map(outlet =>
                  <div className='pb2' key={outlet.label + outlet.value}>
                    <Checkbox
                      checked={selectedOutlets.includes(outlet)}
                      onChange={() => toggleOutlet(outlet)}
                      label={`${outlet.label}, ${outlet.value}`}
                      />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
        <div className='flex p4 bg-white border-top border-gray80'>
          <div className='flex-auto flex order-last' style={{justifyContent: 'flex-end'}}>
            <button className='btn bg-completed white order-last' onClick={onSubmit} data-id='merge-contacts-form-submit-button'>Finish Merge</button>
            <button className='btn bg-transparent gray40 mr2' onClick={onDismiss} data-id='merge-contacts-form-cancel-button'>Cancel</button>
          </div>
          <div className='flex-auto'>
            <label className='btn bg-transparent red'>Merging contacts cannot be undone</label>
          </div>
        </div>
      </div>
    )
  }
}

class MergeContactsContainer extends React.Component {
  constructor (props) {
    super(props)
    this.uniqueOutlets = this.getUniqueOutlets(props.contacts)
    this.uniqueNames = this.getUniqueNames(props.contacts)
    this.state = {
      name: this.uniqueNames[0],
      selectedOutlets: [...this.uniqueOutlets]
    }
  }

  onSubmit = () => {
    const {contacts} = this.props
    Meteor.call('mergeContacts', {
      contactSlugs: contacts.map(c => c.slug),
      name: this.state.name,
      outlets: this.state.selectedOutlets
    }, (err, contact) => {
      if (err) {
        this.props.onDismiss()
        console.log(err)
        this.props.snackbar.error('merge-contacts-failure')
      } else {
        this.props.onMerged()
        this.props.snackbar.show(<div>
          <span>Contacts merged into </span>
          <Link to={`/contact/${contact.slug}`} className='semibold underline'>
            {contact.name}
          </Link>
        </div>)
      }
    })
  }

  onChangeName = (name) => {
    this.setState({name})
  }

  toggleOutlet = (outlet) => {
    if (this.state.selectedOutlets.includes(outlet)) {
      this.setState(s => ({
        selectedOutlets: s.selectedOutlets.filter(o => o !== outlet)
      }))
    } else {
      this.setState(s => ({
        selectedOutlets: s.selectedOutlets.concat(outlet)
      }))
    }
  }

  getUniqueNames (contacts) {
    return Array.from(new Set(contacts.map(c => c.name)))
  }

  getUniqueOutlets (contacts) {
    // Flat map, then map to array of arrays of stringified version (key) to object. (value)
    // return unique objects.
    return Array.from(new Map(
      contacts
        .map(c => c.outlets)
        .reduce((a, b) => a.concat(b))
        .map(outlet => [JSON.stringify(outlet), outlet])
      ).values()
    )
  }

  render () {
    const {contacts} = this.props
    const hasConflicts = this.uniqueNames.length > 1 || !deepEqual(contacts[0].outlets, this.uniqueOutlets)

    return (
      <MergeContacts
        {...this.props}
        {...this.state}
        onSubmit={this.onSubmit}
        toggleOutlet={this.toggleOutlet}
        onChangeName={this.onChangeName}
        uniqueNames={this.uniqueNames}
        uniqueOutlets={this.uniqueOutlets}
        hasConflicts={hasConflicts} />
    )
  }
}

export default withSnackbar(Modal(MergeContactsContainer, {
  'data-id': 'merge-contact-modal'
}))

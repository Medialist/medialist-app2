import React from 'react'
import PropTypes from 'prop-types'
import deepEqual from 'deep-equal'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import Checkbox from '/imports/ui/tables/checkbox'
import Radio from '/imports/ui/tables/radio'

class MergeContacts extends React.Component {
  static propTypes = {
    contacts: PropTypes.array.isRequired,
    onDismiss: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.uniqueOutlets = this.getUniqueOutlets(props.contacts)
    this.uniqueNames = this.getUniqueNames(props.contacts)
    this.state = {
      name: this.uniqueNames[0],
      selectedOutlets: [...this.uniqueOutlets]
    }
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
    const {
      contacts,
      onDismiss
    } = this.props

    const hasConflicts = this.uniqueNames.length > 1 ||
      !deepEqual(contacts[0].outlets, this.uniqueOutlets)

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center mt6'>Merge these Contacts</div>
        <div className='mb6'>
          <AbbreviatedAvatarList items={contacts} maxTooltip={12} total={contacts.length} />
        </div>
        {hasConflicts && (
          <div className='border-top border-gray80 px7 pt3 pb6'>
            <label className='block gray40 semibold f-sm pt4 mb2'>
              {`You are merging ${contacts.length} contacts. Select the information you'd like to keep`}
            </label>
            <label className='block gray40 semibold f-sm pt4 pb3'>Name</label>
            {this.uniqueNames.map(name =>
              <div className='pb2' key={name}>
                <Radio
                  name='name'
                  checked={name === this.state.name}
                  onChange={() => this.setState({name: name})}
                  label={name} />
              </div>
            )}
            {this.uniqueOutlets.length > 0 ? (
              <div>
                <label className='block gray40 semibold f-sm pt4 pb3'>Jobs</label>
                {this.uniqueOutlets.map(outlet =>
                  <div className='pb3' key={outlet.label + outlet.value}>
                    <Checkbox
                      checked={this.state.selectedOutlets.includes(outlet)}
                      onChange={() => this.toggleOutlet(outlet)}
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
            <button className='btn bg-completed white order-last' onClick={onDismiss} data-id='merge-contacts-form-submit-button'>Save</button>
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

export default withSnackbar(Modal(MergeContacts, {
  'data-id': 'merge-contact-modal'
}))

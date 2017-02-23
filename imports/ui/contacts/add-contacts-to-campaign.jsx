import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon } from '../images/icons'
import createSearchContainer from '../campaigns/campaign-search-container'
import { SquareAvatar } from '../images/avatar'
import { TimeFromNow } from '../time/time'
import withSnackbar from '../snackbar/with-snackbar'
import { batchAddContactsToCampaigns } from '/imports/api/contacts/methods'

const AddContactsToCampaigns = createSearchContainer(React.createClass({
  propTypes: {
    title: PropTypes.string,
    term: PropTypes.string,
    onTermChange: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    campaigns: PropTypes.array.isRequired,
    children: PropTypes.node
  },

  onChange (e) {
    this.props.onTermChange(e.target.value)
  },

  onKeyPress (e) {
    if (e.key !== 'Enter') return
    const { campaigns, onAdd } = this.props
    if (!campaigns[0]) return
    onAdd(campaigns[0])
  },

  render () {
    const {
      title,
      term,
      campaigns,
      onAdd,
      children
    } = this.props

    const { onChange, onKeyPress } = this

    return (
      <div>
        <div className='f-xl regular center mt6'>{title}</div>
        <div className='mb6'>{children}</div>
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input ref={(input) => input && input.focus()} className='flex-auto f-sm pa2 mx2' placeholder='Search campaigns' onChange={onChange} style={{outline: 'none'}} onKeyPress={onKeyPress} value={term} />
        </div>
        <div style={{height: '413px', overflowY: 'scroll'}}>
          <ResultList onAdd={onAdd} results={campaigns} />
        </div>
      </div>
    )
  }
}))

const AddContactsToCampaignsContainer = withSnackbar(React.createClass({
  propTypes: {
    onDismiss: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    snackbar: PropTypes.object.isRequired
  },

  getInitialState () {
    return { term: '' }
  },

  onAdd (item) {
    const {contacts, snackbar, onDismiss} = this.props
    const contactSlugs = contacts.map((c) => c.slug)
    const campaignSlugs = [item.slug]
    batchAddContactsToCampaigns.call({contactSlugs, campaignSlugs}, (err, res) => {
      if (err) {
        console.log(err)
        return snackbar.show('Sorry, that didn\'t work')
      }
      onDismiss()
      return snackbar.show((
        <div>
          <span>Added {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} to </span>
          <Link to={`/campaign/${item.slug}`} className='underline semibold'>
            {item.name}
          </Link>
        </div>
      ))
    })
  },

  onTermChange (term) {
    this.setState({ term })
  },

  render () {
    const {
      onTermChange,
      onAdd
    } = this
    const { term } = this.state
    return (
      <AddContactsToCampaigns
        {...this.props}
        term={term}
        onTermChange={onTermChange}
        onAdd={onAdd} />
    )
  }
}))

export default Modal(AddContactsToCampaignsContainer)

const CampaignResult = (props) => {
  const {style, avatar, name, client, updatedAt} = props
  return (
    <div style={{lineHeight: 1.3, ...style}} {...props}>
      <SquareAvatar size={38} avatar={avatar} name={name} />
      <div className='inline-block align-top pl3' style={{width: 220}}>
        <div className='f-md semibold gray10 truncate'>{name}</div>
        <div className='f-sm normal nowrap'>
          {client && (
            <span>
              <span className='gray20 truncate'>{client.name}</span>
              <span> &mdash; </span>
            </span>
          )}
          <TimeFromNow className='gray40' date={updatedAt} />
        </div>
      </div>
    </div>
  )
}

const ResultList = React.createClass({
  propTypes: {
    onAdd: PropTypes.func.isRequired,
    results: PropTypes.array.isRequired
  },

  render () {
    const { results, onAdd } = this.props

    return (
      <div>
        {results.map((res) => {
          const {slug, contacts} = res
          const contactCount = Object.keys(contacts).length
          return (
            <div
              className='flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger hover-color-trigger'
              key={slug}
              onClick={() => onAdd(res)}>
              <div className='flex-auto'>
                <CampaignResult {...res} />
              </div>
              <div className='flex-none px4 f-sm gray40 hover-gray20'>
                {contactCount} {contactCount === 1 ? 'contact' : 'contacts'} involved
              </div>
              <div className='flex-none pl4 pr2 opacity-0 hover-opacity-100'>
                <AddIcon />
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})

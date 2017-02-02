import React, { PropTypes } from 'react'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon, SelectedIcon, RemoveIcon } from '../images/icons'
import AbbreviatedAvatarList from '../lists/abbreviated-avatar-list'
import Tooltip from '../navigation/tooltip'
import createSearchContainer from '../campaigns/campaign-search-container'
import { SquareAvatar } from '../images/avatar'
import { TimeFromNow } from '../time/time'
import withSnackbar from '../snackbar/with-snackbar'

const AddContactsToCampaigns = createSearchContainer(React.createClass({
  propTypes: {
    term: PropTypes.string,
    onTermChange: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isActive: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    campaigns: PropTypes.array.isRequired,
    selected: PropTypes.array.isRequired
  },

  onChange (e) {
    this.props.onTermChange(e.target.value)
  },

  onKeyPress (e) {
    if (e.key !== 'Enter') return

    const { term, isActive, campaigns, onAdd, onTermChange } = this.props
    if (!term) return

    const res = campaigns[0]
    if (!res || isActive(res)) return

    onAdd(res)
    onTermChange('')
  },

  render () {
    const {
      term,
      onReset,
      onSubmit,
      contacts,
      campaigns,
      onAdd,
      onRemove,
      onCreate,
      isActive
    } = this.props

    const { onChange, onKeyPress } = this
    const scrollableHeight = Math.max(window.innerHeight - 380, 80)

    return (
      <div>
        <h1 className='f-xl regular center mt6'>Add these Contacts to a Campaign</h1>
        <AbbreviatedAvatarList items={contacts} className='my4 px4' />
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input className='flex-auto f-lg pa2 mx2' placeholder='Find a campaign...' onChange={onChange} style={{outline: 'none'}} onKeyPress={onKeyPress} value={term} />
        </div>
        <div style={{height: scrollableHeight, overflowY: 'scroll'}}>
          <ResultList
            isActive={isActive}
            onAdd={onAdd}
            onRemove={onRemove}
            results={campaigns} />
          <CreateContactButton term={term} onCreate={onCreate} />
        </div>
        <form className='py4 border-top border-gray80 flex' onReset={onReset} onSubmit={onSubmit}>
          <div className='flex-auto right-align'>
            <button className='btn bg-transparent gray40 mr2' type='reset'>Cancel</button>
            <button className='btn bg-completed white px3 mr4' type='submit'>Save Changes</button>
          </div>
        </form>
      </div>
    )
  }
}))

const AddContactsToCampaignsContainer = withSnackbar(React.createClass({
  propTypes: {
    onCreate: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    snackbar: PropTypes.object.isRequired
  },

  getInitialState () {
    return { selected: [], term: '' }
  },

  // Is the item selected?
  isActive (item) {
    const { selected } = this.state
    return selected.some((i) => i._id === item._id)
  },

  onAdd (item) {
    this.setState((s) => ({
      selected: s.selected.concat([item])
    }))
  },

  onRemove (item) {
    this.setState((s) => ({
      selected: s.selected.filter((i) => i._id !== item._id)
    }))
  },

  onSubmit (evt) {
    evt.preventDefault()
    const {snackbar} = this.props
    // const campaignSlugs = this.state.selected.map((c) => c.slug)
    snackbar.show('TODO: Add contacts to campaigns api')
    this.onReset()
  },

  onReset () {
    this.props.onDismiss()
    this.deselectAll()
  },

  deselectAll () {
    this.setState({ selected: [] })
  },

  onTermChange (term) {
    this.setState({ term })
  },

  render () {
    const {
      onTermChange,
      isActive,
      onAdd,
      onRemove,
      onReset,
      onSubmit
    } = this
    const { term, selected } = this.state
    return (
      <AddContactsToCampaigns
        term={term}
        onTermChange={onTermChange}
        isActive={isActive}
        onAdd={onAdd}
        onRemove={onRemove}
        onReset={onReset}
        onSubmit={onSubmit}
        selected={selected}
        {...this.props} />
    )
  }
}))

export default Modal(AddContactsToCampaignsContainer)

const CampaignResult = (props) => {
  const {style, avatar, name, client, updatedAt} = props
  return (
    <div style={{lineHeight: 1.3, ...style}} {...props}>
      <SquareAvatar size={38} avatar={avatar} name={name} />
      <div className='inline-block align-top pl3' style={{width: 220, height: 55}}>
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
    isActive: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    results: PropTypes.array.isRequired
  },

  onClick (item, isActive) {
    const { onAdd, onRemove } = this.props
    return isActive ? onRemove(item) : onAdd(item)
  },

  render () {
    const { results } = this.props
    const { onClick } = this

    return (
      <div>
        {results.map((res) => {
          const isActive = this.props.isActive(res)
          const {slug, contacts} = res
          const contactCount = Object.keys(contacts).length
          return (
            <div
              className={`flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger hover-color-trigger ${isActive ? 'active' : ''}`}
              key={slug}
              onClick={() => onClick(res, isActive)}>
              <div className='flex-auto'>
                <CampaignResult {...res} />
              </div>
              <div className='flex-none px4 f-sm gray40 hover-gray20'>
                {contactCount} {contactCount === 1 ? 'contacts' : 'contact'} involved
              </div>
              <div className={`flex-none pl4 pr2 ${isActive ? '' : 'opacity-0'} hover-opacity-100`}>
                {isActive ? <SelectedIcon /> : <AddIcon />}
              </div>
              <div className={`flex-none pl2 pr4 ${isActive ? 'hover-opacity-100' : 'opacity-0'} gray20 hover-fill-trigger`}>
                {isActive ? <Tooltip title='Remove'><RemoveIcon /></Tooltip> : <RemoveIcon />}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})

const CreateContactButton = ({ term, onCreate }) => {
  if (!term) return null
  const onCreateClick = () => onCreate({ name: term })
  return (
    <div key='createContact' className='p4 center'>
      <button type='button' className='btn bg-blue white' onClick={onCreateClick}>
        Create new Contact "{term}"
      </button>
    </div>
  )
}

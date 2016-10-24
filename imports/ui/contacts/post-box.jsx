import React, { PropTypes } from 'react'
import { FeedFeedbackIcon, FeedCoverageIcon, FeedNeedToKnowIcon } from '../images/icons'

const FeedbackInput = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    focused: PropTypes.bool.isRequired
  },
  render () {
    const {focused, contact} = this.props
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (<div>
      <textarea rows={rows} className='textarea mb1' style={{border: '0 none'}} placeholder={`Any updates on ${name}\'s work?`} />
      <div className={className}>
        <button className='btn bg-gray80 right'>Post</button>
        <button className='btn bg-transparent border-gray80'>Select a Campaign</button>
        <button className='btn bg-transparent border-gray80 mx2'>Select status</button>
      </div>
    </div>)
  }
})

const CoverarageInput = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    focused: PropTypes.bool.isRequired
  },
  render () {
    const {focused, contact} = this.props
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (<div>
      <textarea rows={rows} className='textarea mb1' style={{border: '0 none'}} placeholder={`Did ${name} post any coverage?`} />
      <div className={className}>
        <button className='btn bg-gray80 right'>Post</button>
        <button className='btn bg-transparent border-gray80'>Select a Campaign</button>
      </div>
    </div>)
  }
})

const NeedToKnowInput = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    focused: PropTypes.bool.isRequired
  },
  render () {
    const {focused, contact} = this.props
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (<div>
      <textarea rows={rows} className='textarea mb1' style={{border: '0 none'}} placeholder={`Share something important to know about ${name}`} />
      <div className={className}>
        <button className='btn bg-gray80 right'>Post</button>
        <button className='btn bg-transparent border-gray80 bold'>B</button>
        <button className='btn bg-transparent border-gray80 italic mx2'>i</button>
      </div>
    </div>)
  }
})

const PostBox = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired
  },

  getInitialState () {
    return { focused: false, selected: 'Feedback' }
  },

  getTabClassName (tab) {
    const base = 'inline-block px4 py3 pointer f-sm semibold '
    return base + (this.state.selected === tab ? 'bg-white shadow-2' : 'gray60')
  },

  getInputForTab (tab, contact, focused) {
    if (tab === 'Feedback') return <FeedbackInput contact={contact} focused={focused} />
    if (tab === 'Coverage') return <CoverarageInput contact={contact} focused={focused} />
    if (tab === 'Need to Know') return <NeedToKnowInput contact={contact} focused={focused} />
    return null
  },

  render () {
    const { contact } = this.props
    const { selected, focused } = this.state

    return (
      <div onFocus={() => this.setState({focused: true})}>
        <nav className='block' style={{padding: '2px 1px 0', height: 50, overflowY: 'hidden'}}>
          <div className={this.getTabClassName('Feedback')} onClick={() => this.setState({ selected: 'Feedback' })} >
            <FeedFeedbackIcon /> Feedback
          </div>
          <div className={this.getTabClassName('Coverage')} onClick={() => this.setState({ selected: 'Coverage' })} >
            <FeedCoverageIcon /> Coverage
          </div>
          <div className={this.getTabClassName('Need to Know')} onClick={() => this.setState({ selected: 'Need to Know' })} >
            <FeedNeedToKnowIcon /> Need to Know
          </div>
        </nav>
        <div style={{padding: '0 1px'}}>
          <div className='bg-white shadow-2 p3 pb0'>
            {this.getInputForTab(selected, contact, focused)}
          </div>
        </div>
      </div>
    )
  }
})

export default PostBox

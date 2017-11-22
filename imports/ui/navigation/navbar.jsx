import React from 'react'
import PropTypes from 'prop-types'
import { Link, IndexLink } from 'react-router'
import UserInfo from '/imports/ui/navigation/user-info'
import { Logo, MenuActivityIcon, MenuCampaignIcon, MenuContactIcon } from '/imports/ui/images/icons'

const linkStyle = { padding: '19px 25px 20px', display: 'inline-block' }

class NavBar extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string,
    avatar: PropTypes.string,
    email: PropTypes.string
  }
  render () {
    const { user } = this.props
    const { name, avatar } = user.profile
    const email = user.emails[0].address
    return (
      <div className='navbar bg-gray10 clearfix'>
        <nav className='inline-block align-top'>
          <IndexLink to='/' style={{ padding: '19px 28px 18px 26px', display: 'inline-block' }} className='white f5 semibold xs-hide align-top' >
            <Logo />
          </IndexLink>
          <IndexLink to='/' style={linkStyle} className='white f-sm semibold opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black' data-id='activity-tab'>
            <MenuActivityIcon style={{verticalAlign: 2}} />
            <span style={{marginLeft: 3}}>Activity</span>
          </IndexLink>
          <Link to='/campaigns' style={linkStyle} className='white f-sm semibold opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black' data-id='campaigns-tab'>
            <MenuCampaignIcon style={{verticalAlign: 2}} />
            <span style={{marginLeft: 3}}>Campaigns</span>
          </Link>
          <Link to='/contacts' style={linkStyle} className='white f-sm semibold opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black' data-id='contacts-tab'>
            <MenuContactIcon style={{verticalAlign: 2}} />
            <span style={{marginLeft: 3}}>Contacts</span>
          </Link>
        </nav>
        <div className='inline-block right'>
          <UserInfo name={name} avatar={avatar} email={email} />
        </div>
      </div>
    )
  }
}

export default NavBar

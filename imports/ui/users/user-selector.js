import React from 'react'
import PropTypes from 'prop-types'
import { CircleAvatar } from '/imports/ui/images/avatar'
import createSearchContainer from '/imports/ui/lists/searchable-list'
import { Select, Option } from '/imports/ui/navigation/select'
import SearchBox from '/imports/ui/lists/search-box'
import Tooltip from '/imports/ui/navigation/tooltip'
import { LoadingBar } from '/imports/ui/lists/loading'
import { SearchIcon } from '/imports/ui/images/icons'

export const UserButton = ({user}) => {
  if (!user) return <span className='gray60'>No owner</span>
  const {avatar, name} = user
  return (
    <Tooltip title={name}>
      <CircleAvatar avatar={avatar} name={name} />
    </Tooltip>
  )
}

export const UserOption = ({user, selected, ...props}) => {
  const {name, avatar} = user.profile
  return (
    <Option selected={selected} {...props}>
      <CircleAvatar className='mr2' name={name} avatar={avatar} />
      {selected ? (
        <span className='gray10 semibold f-md'>{name}</span>
      ) : (
        <span className='gray20 normal f-md'>{name}</span>
      )}
    </Option>
  )
}

export default class UserSelector extends React.Component {
  static propTypes = {
    selectedUser: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    option: PropTypes.func.isRequired,
    button: PropTypes.func.isRequired,
    initialItems: PropTypes.array
  }

  static defaultProps = {
    button: UserButton,
    option: UserOption
  }

  render () {
    const {selectedUser, onSelect, alignRight, arrowPosition, top, option, hideChevron} = this.props
    const CustomButton = this.props.button
    return (
      <Select
        width={250}
        top={top}
        alignRight={alignRight}
        arrowPosition={arrowPosition}
        hideChevron={hideChevron}
        buttonText={<CustomButton user={selectedUser} />} >
        {closeDropdown => (
          <SearchableUserList
            option={option}
            selectedUser={selectedUser}
            onSelect={(userRef) => {
              onSelect(userRef)
              closeDropdown()
            }}
          />
        )}
      </Select>
    )
  }
}

class SearchList extends React.Component {
  static propsTypes = {
    onTermChange: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired,
    loading: PropTypes.bool
  }
  render () {
    const {items, children, loading} = this.props
    return (
      <div>
        <SearchBox
          placeholder='Search teammates...'
          style={{borderTop: '0 none', borderLeft: '0 none', borderRight: '0 none'}}
          onTermChange={term => this.props.onTermChange({target: {name: 'term', value: term}})}
         />
        {loading && <LoadingBar />}
        {children(items)}
      </div>
    )
  }
}

const SearchableList = createSearchContainer(SearchList, {
  minSearchLength: 1
})

const SearchableUserList = ({selectedUser, onSelect, option}) => {
  const CustomOption = option
  const query = {
    roles: 'team',
    'profile.name': {
      '$exists': true
    },
    '$or': [{
      'profile.name': {
        $regex: '$term',
        $options: 'i'
      }
    }, {
      'emails.address': {
        $regex: '$term',
        $options: 'i'
      }
    }]
  }
  const fields = {
    '_id': 1,
    'profile.name': 1,
    'profile.avatar': 1,
    'roles': 1
  }
  return (
    <SearchableList query={query} fields={fields} collection='users' sort={{'profile.name': 1}}>
      {(users) => (
        <div style={{height: 200, overflowY: 'auto'}}>
          {users.map(u => {
            const selected = selectedUser && u._id === selectedUser._id
            return (
              <CustomOption
                key={u._id}
                user={u}
                selected={selected}
                style={{paddingTop: 5, paddingBottom: 5}}
                onClick={() => onSelect(u)} />
            )
          })}
          {!users || !users.length ? (
            <div className='center'>
              <div className='inline-block bg-gray80 mt5' style={{borderRadius: 15, width: 30, height: 30, lineHeight: '26px'}}>
                <SearchIcon className='gray20' />
              </div>
              <div className='gray20 mt3 f-md'>
                No teammates found
              </div>
            </div>
          ) : null }
        </div>
      )}
    </SearchableList>
  )
}

import React from 'react'
import PropTypes from 'prop-types'
import { CircleAvatar } from '/imports/ui/images/avatar'
import createSearchContainer from '/imports/ui/lists/searchable-list'
import { Select, Option } from '/imports/ui/navigation/select'
import SearchBox from '/imports/ui/lists/search-box'
import { LoadingBar } from '/imports/ui/lists/loading'

export default class UserSelector extends React.Component {
  static propTypes = {
    selectedUser: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    option: PropTypes.func.isRequired,
    button: PropTypes.func,
    initialItems: PropTypes.array
  }

  static defaultProps = {
    option: ({profile}) => {
      const {name, avatar} = profile
      return (
        <div>
          <CircleAvatar name={name} avatar={avatar} />
          <span className='ml2'>{name}</span>
        </div>
      )
    }
  }

  render () {
    const {option, selectedUser, initialItems, onSelect} = this.props
    const button = this.props.button || option
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
      <Select buttonText={button(selectedUser)}>
        <SearchableList query={query} fields={fields} collection='users' initialItems={initialItems} limit={5} sort={{'profile.name': 1}}>
          {(users) => (
            <div>
              {users.map(u => (
                <Option key={u._id} selected={selectedUser && u._id === selectedUser._id} onClick={() => onSelect(u)}>
                  {option(u)}
                </Option>
              ))}
            </div>
          )}
        </SearchableList>
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
        <SearchBox onTermChange={term => this.props.onTermChange({target: {name: 'term', value: term}})} />
        {loading && <LoadingBar />}
        {children(items)}
      </div>
    )
  }
}

const SearchableList = createSearchContainer(SearchList, {
  minSearchLength: 1
})

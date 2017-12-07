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
    option: ({profile}, selected) => {
      const {name, avatar} = profile
      return (
        <div>
          <CircleAvatar className='mr2' name={name} avatar={avatar} />
          {selected ? (
            <span className='gray10 semibold'>{name}</span>
          ) : (
            <span className='gray40 normal'>{name}</span>
          )}
        </div>
      )
    }
  }

  render () {
    const {option, selectedUser, initialItems, onSelect, alignRight} = this.props
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
      <Select
        width={250}
        alignRight={alignRight}
        buttonText={button(selectedUser)} >
        <SearchableList query={query} fields={fields} collection='users' initialItems={initialItems} limit={5} sort={{'profile.name': 1}}>
          {(users) => (
            <div>
              {users.map(u => {
                const selected = selectedUser && u._id === selectedUser._id
                return (
                  <Option
                    key={u._id}
                    selected={selected}
                    onClick={() => onSelect(u)}
                    style={{paddingTop: 5, paddingBottom: 5}}>
                    {option(u, selected)}
                  </Option>
                )
              })}
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
        <SearchBox
          placeholder='Search teammates...'
          style={{borderTop: '0 none', borderLeft: '0 none', borderRight: '0 none'}}
          onTermChange={term => this.props.onTermChange({target: {name: 'term', value: term}})} />
        {loading && <LoadingBar />}
        {children(items)}
      </div>
    )
  }
}

const SearchableList = createSearchContainer(SearchList, {
  minSearchLength: 1
})

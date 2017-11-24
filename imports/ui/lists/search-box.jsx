import React from 'react'
import PropTypes from 'prop-types'
import { SearchIcon } from '/imports/ui/images/icons'
import debounce from 'lodash.debounce'
import Loading from './loading'

class SearchBox extends React.Component {
  static propTypes = {
    inputRef: PropTypes.func,
    placeholder: PropTypes.string,
    initialTerm: PropTypes.string,
    onTermChange: PropTypes.func.isRequired,
    onKeyPress: PropTypes.func,
    children: PropTypes.node,
    style: PropTypes.object,
    'data-id': PropTypes.string
  }

  static defaultProps = {
    initialTerm: '',
    placeholder: 'Search...'
  }

  state = {
    isFocused: false
  }

  onChange = debounce(value => this.props.onTermChange(value), 200, {maxWait: 600})

  componentDidMount () {
    const {initialTerm, inputRef} = this.props
    this.inputEl.focus()
    if (initialTerm) {
      this.inputEl.value = initialTerm
    }
    if (inputRef) {
      inputRef(this.inputEl)
    }
  }

  render () {
    const { placeholder, children, onKeyPress, style } = this.props
    const { isFocused } = this.state

    return (
      <div
        style={{paddingLeft: 45, ...style}}
        className='relative border py2 pr1 border-gray80'>
        <SearchIcon
          style={{left: 20, top: 13}}
          className={`absolute f-lg mr2 ${isFocused ? 'blue' : 'gray20'}`} />
        <div className='flex flex-wrap items-start'>
          <div className='inline-block'>
            {children}
          </div>
          <input
            ref={el => { this.inputEl = el }}
            type='search'
            style={{outline: 'none', height: 30, lineHeight: 30, backgroundColor: 'transparent'}}
            className='flex-auto f-md normal gray20 placeholder-gray60'
            onChange={e => this.onChange(e.target.value)}
            onKeyPress={onKeyPress}
            onFocus={() => this.setState({isFocused: true})}
            onBlur={() => this.setState({isFocused: false})}
            placeholder={placeholder}
            data-id={this.props['data-id']} />
        </div>
      </div>
    )
  }
}

export default SearchBox

export const SearchBoxCount = ({ type, loading, total }) => {
  const suffix = `${type}${total === 1 ? '' : 's'}`
  return (
    <div
      className='f-xs gray60'
      style={{position: 'relative', top: -35, right: 20, textAlign: 'right', zIndex: 0}}>
      { loading ? <Loading className='lolo-gray80' /> : null }
      { !loading && total ? <span>{total} {suffix}</span> : <span />}
    </div>
  )
}

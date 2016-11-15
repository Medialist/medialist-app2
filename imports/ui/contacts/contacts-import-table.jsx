import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'

const fields = [
  'name',
  'address',
  'primaryOutlets',
  'otherOutlets',
  'sectors',
  'jobTitles',
  'languages'
]

const ImportTable = React.createClass({
  PropTypes: {
    headerRow: PropTypes.array.isRequired
  },
  getInitialState () {
    return {
      open: false,
      focusedField: '',
      columns: readColumns(this.props)
    }
  },
  onDismiss () {
    this.setState({ open: false })
  },
  onSelect (heading, field) {
    const columns = Object.assign({}, this.state.columns, {[heading]: {field: field, selected: true}})
    this.setState({
      columns: columns,
      focusedField: '',
      open: false
    })
  },
  unSelect (heading) {
    const columns = Object.assign({}, this.state.columns, {[heading]: {selected: false}})
    this.setState({columns})
  },
  onFocus (heading) {
    this.setState({
      open: true,
      focusedField: heading
    })
  },
  render () {
    const { onDismiss, onFocus, onSelect, unSelect } = this
    const { open, focusedField, columns } = this.state
    const overflow = {
      overflowX: 'hidden',
      overflowY: 'visible',
      overflow: 'scroll',
      whiteSpace: 'nowrap'
    }
    return (
      <div className='bg-white' style={overflow}>
        {Object.keys(columns).map((heading) => {
          const { field, selected } = columns[heading]
          return (
            <div className='inline-block pointer center py2 px3 border border-gray80' style={{width: '12rem'}}>
              <Dropdown>
                <input className='input center' value={selected ? field : ''} placeholder='Select field' onFocus={(evt) => onFocus(field)} />
                <DropdownMenu open={open && field === focusedField} onDismiss={onDismiss}>
                  <ul className='list-reset'>
                    {fields.map((f) => {
                      return <li className='p2 left-align hover-bg-blue' onClick={(evt) => onSelect(heading, f)}>{f}</li>
                    })}
                  </ul>
                </DropdownMenu>
              </Dropdown>
              <div className='center py2'>
                <input type='checkbox' checked={selected} onChange={(evt) => unSelect(heading)} />
              </div>
              <div className='center py2'>
                <label>{heading}</label>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})

export default ImportTable

function readColumns (props) {
  const { headerRow } = props
  return headerRow.reduce((cols, heading) => {
    const i = fields.indexOf(heading)
    i > 0 ? cols[heading] = {field: fields[i], selected: true} : cols[heading] = {field: heading, selected: false}
    return cols
  }, {})
}

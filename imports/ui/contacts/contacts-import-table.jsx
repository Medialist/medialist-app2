import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import Checkbox from '../tables/checkbox'

const fields = [
  'name',
  'address',
  'primaryOutlets',
  'otherOutlets',
  'sectors',
  'jobTitles',
  'languages',
  'emails',
  'phone',
  'socials'
]

const ImportTable = React.createClass({
  PropTypes: {
    headerRow: PropTypes.array.isRequired,
    dataRows: PropTypes.array.isRequired,
    setColumnCount: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      open: false,
      focusedField: '',
      columns: readColumns(this.props)
    }
  },
  componentWillMount () {
    this.props.setColumnCount(countSelected(this.state.columns))
  },
  onDismiss () {
    this.setState({ open: false })
  },
  onSelect (heading, field) {
    const { columns } = this.state
    const { setColumnCount } = this.props
    if (columns[field] && columns[field].selected) return this.onDismiss()

    const newColumns = Object.assign({}, columns, {[heading]: {field: field, selected: true}})
    this.setState({
      columns: newColumns,
      focusedField: '',
      open: false
    })

    setColumnCount(countSelected(columns))
  },
  toggleSelect (columnHeading) {
    const { field, selected } = columnHeading
    const { setColumnCount } = this.props
    const columns = Object.assign({}, this.state.columns, {[field]: {field, selected: !selected}})
    this.setState({columns})
    setColumnCount(countSelected(columns))
  },
  onFocus (heading) {
    this.setState({
      open: true,
      focusedField: heading
    })
  },
  render () {
    const { onDismiss, onFocus, onSelect, toggleSelect } = this
    const { open, focusedField, columns } = this.state
    const { dataRows } = this.props
    const overflow = {
      overflowX: 'hidden',
      overflow: 'scroll',
      whiteSpace: 'nowrap'
    }
    return (
      <div className='bg-white pl2' style={overflow}>
        {Object.keys(columns).map((heading) => {
          const { field, selected } = columns[heading]
          return (
            <div className='inline-block pointer border-bottom border-gray80' style={{width: '12rem'}} key={heading}>
              <Dropdown>
                <input className='input m2' style={{width: 'auto'}} value={selected ? field : ''} placeholder='Select field' onFocus={(evt) => onFocus(field)} />
                <DropdownMenu open={open && field === focusedField} onDismiss={onDismiss}>
                  <ul className='list-reset mt0'>
                    {fields.map((f) => {
                      return <li className='p2 left-align hover-bg-blue' onClick={(evt) => onSelect(heading, f)}>{f}</li>
                    })}
                  </ul>
                </DropdownMenu>
              </Dropdown>
              <div className='bg-gray90'>
                <Checkbox className='inline-block my4 mx2' checked={selected} data={columns[heading]} onChange={toggleSelect} />
                <label className='inline-block ml1' >{heading}</label>
              </div>
            </div>
          )
        })}
        {dataRows.map((row) => {
          return (
            <div className='block pl2'>
              {Object.keys(row).map((field) => {
                return <div className='inline-block py2 border-bottom border-gray80 gray40' style={{width: '12rem'}}>{row[field] || ' '}</div>
              })}
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

function countSelected (columns) {
  return Object.keys(columns).reduce((count, field) => {
    if (columns[field].selected) count += 1
    return count
  }, 0)
}

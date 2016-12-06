import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import Checkbox from '../tables/checkbox'
import { labels } from './csv-to-contacts.js'

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
  toggleSelect (heading, columnHeading) {
    const { field, selected } = columnHeading
    const { setColumnCount } = this.props
    const columns = Object.assign({}, this.state.columns, {[heading]: {field, selected: !selected}})
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
    return (
      <div style={{overflowY: 'scroll'}}>
        <table className='table bg-white shadow-2' >
          <thead>
            <tr>
              {Object.keys(columns).map((heading, i) => {
                const { field, selected } = columns[heading]
                return (
                  <th key={i} className='pointer bg-white' style={{padding: '0px 80px 0 0', borderLeft: '0 none', borderRight: '0 none'}}>
                    <Dropdown className='right'>
                      <input className='input m2' style={{width: 180}} value={selected ? field : ''} placeholder='Select a field' onFocus={(evt) => onFocus(field)} />
                      <DropdownMenu open={open && field === focusedField} onDismiss={onDismiss}>
                        <ul className='list-reset mt0'>
                          {labels.map((f) => {
                            return <li className='p2 left-align hover-bg-blue' onClick={(evt) => onSelect(heading, f)}>{f}</li>
                          })}
                        </ul>
                      </DropdownMenu>
                    </Dropdown>
                  </th>
                )
              })}
            </tr>
            <tr className='bg-gray90'>
              {Object.keys(columns).map((heading, i) => {
                const { selected } = columns[heading]
                return (
                  <th key={i} className='left-align' style={{padding: '5px 20px', borderLeft: '0 none', borderRight: '0 none'}}>
                    <Checkbox className='inline-block my3' checked={selected} data={columns[heading]} onChange={toggleSelect.bind(null, heading)} />
                    <label className='inline-block ml1' >{heading}</label>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row) => (
              <tr>
                {Object.keys(row).map((field, i) => {
                  return <td key={i} className={i === 0 ? 'gray10' : 'gray20'}>{row[field] || ' '}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
})

export default ImportTable

function readColumns (props) {
  const { headerRow } = props
  return headerRow.reduce((cols, heading) => {
    const i = labels.indexOf(heading)
    i > 0 ? cols[heading] = {field: labels[i], selected: true} : cols[heading] = {field: heading, selected: false}
    return cols
  }, {})
}

function countSelected (columns) {
  return Object.keys(columns).reduce((count, field) => {
    if (columns[field].selected) count += 1
    return count
  }, 0)
}

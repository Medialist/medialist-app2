import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

const Radio = ({ className, label, name, checked, group, data, onChange, ...props }) => {
  return (
    <label className={classnames(className, 'inline-block', 'pointer')} data-id={`${props['data-id']}-label`}>
      <input
        className={classnames('border', {
          'border-gray20': !checked,
          'bg-white': !checked,
          'border-blue': checked,
          'bg-blue': checked
        })}
        style={{
          verticalAlign: '-2px',
          outline: 'none',
          margin: 0,
          appearance: 'none',
          WebkitAppearance: 'none',
          borderRadius: 14,
          borderWidth: 1,
          width: 14,
          height: 14,
          boxShadow: 'inset 0 0 0 2px white'}}
        type='radio'
        name={name}
        checked={checked}
        onChange={() => onChange(data)}
        data-id={props['data-id']}
      />
      <span className={classnames('f-md pl2', {gray10: checked, semibold: checked, gray20: !checked})}>
        {label}
      </span>
    </label>
  )
}

Radio.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func,
  checked: PropTypes.bool.isRequired,
  label: PropTypes.node.isRequired
}

export default Radio

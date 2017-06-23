import React from 'react'

const FormSection = ({label, addLinkText, addLinkId, onAdd, addLinkClassName = 'mt2', children}) => (
  <section className='pl6 pb3 mx-auto' style={{maxWidth: 500}}>
    <label className='block gray40 semibold f-sm pt4 mb2'>{label}</label>
    <div>
      {children}
    </div>
    {addLinkText && (
      <div className={addLinkClassName}>
        <span className='pointer inline-block blue f-xs underline' onClick={onAdd} data-id={addLinkId}>
          {addLinkText}
        </span>
      </div>
    )}
  </section>
)

export default FormSection

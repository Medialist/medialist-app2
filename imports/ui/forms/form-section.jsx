import React from 'react'

const FormSection = ({label, addLinkText, onAdd, children}) => (
  <section className='pl6 pb3 mx-auto' style={{maxWidth: 500}}>
    <label className='block gray40 semibold f-sm pt4 mb2'>{label}</label>
    <div>
      {children}
    </div>
    {addLinkText && (
      <div className='mt2'>
        <span className='pointer inline-block blue f-xs underline' onClick={onAdd}>
          {addLinkText}
        </span>
      </div>
    )}
  </section>
)

export default FormSection

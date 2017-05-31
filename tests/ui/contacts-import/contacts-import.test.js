import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'

import ContactsImport1 from '../../../imports/ui/contacts-import/contacts-import-1-upload-page.jsx'

test('should render without exploding', (t) => {
  t.plan(1)
  const wrapper = shallow(<ContactsImport1 />)
  t.is(wrapper.length, 1)
})

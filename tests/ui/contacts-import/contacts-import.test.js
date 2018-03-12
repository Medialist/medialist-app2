import test from 'ava'
import React from 'react'
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15'
import ContactsImport1 from '../../../imports/ui/contacts-import/contacts-import-1-upload-page.jsx'

Enzyme.configure({ adapter: new Adapter() })

test('should render without exploding', (t) => {
  t.plan(1)
  const wrapper = shallow(<ContactsImport1 />)
  t.is(wrapper.length, 1)
})

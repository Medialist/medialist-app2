import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Embeds from '../embeds'
import {
  createEmbed
} from './methods'

describe.only('createEmbed', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createEmbed.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createEmbed.validate({}), /Url is required/)
    assert.throws(() => createEmbed.validate({url: 1}), /Url must be a string/)
    assert.throws(() => createEmbed.validate({url: 'goober://fools.gold'}), /Url/)
    assert.doesNotThrow(() => createEmbed.validate({url: 'https://wizard.cool'}))
  })

  it('should scrape the url and insert the result into the Embeds collection', function (done) {
    this.timeout(10000)
    const url = 'http://www.wired.co.uk/article/nintendo-switch-no-save-data-transfer'
    // const url = 'https://www.theguardian.com/technology/2016/may/04/gmail-yahoo-email-password-hack-hold-security'
    const res = createEmbed.run.call({userId: 'alf'}, {url})
    console.log(res)
    done()
  })

})
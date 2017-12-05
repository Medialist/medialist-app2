module.exports = {
  selector: '[data-id=masterlists-selector]',
  elements: {
    all: '[data-slug=all]',
    allSelected: '[data-slug=all][data-selected=true]',
    my: '[data-slug=my]',
    mySelected: '[data-slug=my][data-selected=true]',
    more: '[data-id=more]'
  },
  commands: [{
    clickMasterListBySlug: function (slug) {
      const selector = `[data-slug=${slug}]`

      this.api.elements('css selector', selector, (res) => {
        if (!res.value.length) {
          this.click('@more')
        }
      })

      this
        .waitForElementVisible(selector)
        .click(selector)

      return this
    }
  }]
}

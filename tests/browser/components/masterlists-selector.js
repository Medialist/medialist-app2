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

      this
        .waitForElementPresent(selector)
        .isVisible(selector, (res) => {
          if (!res.value) {
            this.click('@more')
          }
        })
        .waitForElementVisible(selector)
        .click(selector)

      return this
    }
  }]
}

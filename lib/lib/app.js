// Global app settings
App = {
  contactSuggestions: 5,
  clientSuggestions: 5,
  medialistSuggestions: 5,
  cleanSlug: function(slug) {
    return slug.replace(/[^a-zA-Z0-9_\-]/g, '')
  },
  uniqueSlug: function (slug, collection) {
    var newSlug = slug
    var suffix = 1
    while (collection.find({ slug: newSlug }).count()) {
      newSlug = slug + suffix.toString()
      suffix += 1
    }
    return newSlug
  },
  firstName: function (fullName) {
    if (!fullName) return fullName
    var ind = fullName.indexOf(' ')
    return ind > -1 ? fullName.substr(0, ind) : fullName
  },
  cleanFeedback: function (raw) {
    if (Meteor.isClient) {
      return raw.replace(/<br>/g, '\n\r').replace(/&nbsp;/, ' ')
    } else {
      return sanitizeHtml(raw, { allowedTags: [] })
    }
  }
}

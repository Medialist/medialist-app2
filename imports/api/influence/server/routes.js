import { JsonRoutes, RestMiddleware } from 'meteor/simple:json-routes'
import { handleSocialsUpdate } from '/imports/api/influence/server/socials'

// Send sensible errors when route handler throws.
JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson)

JsonRoutes.add('post', '/webhook/socials/update', function (req, res, next) {
  console.log('Socials update', req.body)
  handleSocialsUpdate(req.body)

  JsonRoutes.sendResult(res, {
    code: 200,
    headers: {}
  })
})


exports.command = function addTeamMembersToCampaign (users, campaign, callback) {
  this.perform((done) => {
    this.ddp.client.call('Campaigns/addTeamMates', [ {
      _id: campaign._id,
      userIds: users.map(users => users._id)
    } ], (error) => {
      if (error) {
        throw error
      }

      callback()
      done()
    })
  })

  return this
}

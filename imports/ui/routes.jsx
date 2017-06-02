import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import Layout from '/imports/ui/layout'
import DashboardPage from '/imports/ui/dashboard/dashboard-page'
import NotificationsPage from '/imports/ui/users/notifications-page'
import CampaignsPage from '/imports/ui/campaigns/campaigns-page'
import CampaignActivityPage from '/imports/ui/campaigns/campaign-activity-page'
import CampaignContactsPage from '/imports/ui/campaigns/campaign-contacts-page'
import ContactsPage from '/imports/ui/contacts/contacts-page'
import ContactsImportUpload from '/imports/ui/contacts-import/contacts-import-1-upload-page'
import ContactsImportPreview from '/imports/ui/contacts-import/contacts-import-2-preview-page'
import ContactsImportProcessing from '/imports/ui/contacts-import/contacts-import-3-processing-page'
import ContactPage from '/imports/ui/contacts/contact-page'
import ContactCampaignsPage from '/imports/ui/contacts/contact-campaigns-page'
import SettingsPage from '/imports/ui/users/settings/settings-page'
import NotFoundPage from '/imports/ui/not-found-page'
import LogoutPage from '/imports/ui/users/logout-page'
import SigningInPage from '/imports/ui/sign-in/signing-in-page'

function handleUpdate () {
  if (this.state.location.action === 'PUSH') {
    window.scrollTo(0, 0)
  }
}

const Routes = ({ store, history }) => {
  return (
    <Router history={history} onUpdate={handleUpdate}>
      <Route path='/sign-in/:token' component={SigningInPage} />
      <Route path='/' component={Layout}>
        <IndexRoute component={DashboardPage} />
        <Route path='notifications' component={NotificationsPage} />
        <Route path='campaigns' component={CampaignsPage} />
        <Route path='campaign'>
          <Route path=':campaignSlug'>
            <IndexRoute component={CampaignActivityPage} />
            <Route path='contact/:contactSlug' component={ContactPage} />
            <Route path='contact/:contactSlug/campaigns' component={ContactCampaignsPage} />
            <Route path='contacts' component={CampaignContactsPage} />
          </Route>
        </Route>
        <Route path='contacts'>
          <IndexRoute component={ContactsPage} />
          <Route path='import'>
            <IndexRoute component={ContactsImportUpload} />
            <Route path='preview' component={ContactsImportPreview} />
            <Route path='processing' component={ContactsImportProcessing} />
          </Route>
        </Route>
        <Route path='contact/:contactSlug'>
          <IndexRoute component={ContactPage} />
          <Route path='campaigns' component={ContactCampaignsPage} />
        </Route>
        <Route path='settings' component={SettingsPage}>
          <Route path=':selected' component={SettingsPage} />
        </Route>
        <Route path='logout' component={LogoutPage} />
        <Route path='*' component={NotFoundPage} />
      </Route>
    </Router>
  )
}

export default Routes

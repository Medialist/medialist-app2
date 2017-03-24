import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import Layout from './layout'
import DashboardPage from './dashboard/dashboard-page'
import NotificationsPage from './users/notifications-page'
import CampaignsPage from './campaigns/campaigns-page'
import CampaignActivityPage from './campaigns/campaign-activity-page'
import CampaignContactsPage from './campaigns/campaign-contacts-page'
import ContactsPage from './contacts/contacts-page'
import ContactsImportUpload from './contacts-import/contacts-import-1-upload-page'
import ContactsImportPreview from './contacts-import/contacts-import-2-preview-page'
import ContactsImportProcessing from './contacts-import/contacts-import-3-processing-page'
import ContactPage from './contacts/contact-page'
import ContactCampaignsPage from './contacts/contact-campaigns-page'
import SettingsPage from './users/settings/settings-page'
import NotFoundPage from './not-found-page'
import LogoutPage from './users/logout-page'
import SigningInPage from './sign-in/signing-in-page'

const Routes = ({ store, history }) => {
  return (
    <Router history={history}>
      <Route path='/sign-in/:token' component={SigningInPage} />
      <Route path='/' component={Layout}>
        <IndexRoute component={DashboardPage} />
        <Route path='notifications' component={NotificationsPage} />
        <Route path='campaigns' component={CampaignsPage} />
        <Route path='campaign'>
          <Route path=':campaignSlug'>
            <IndexRoute component={CampaignActivityPage} />
            <Route path='contact/:contactSlug' component={ContactPage} />
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

import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import Layout from './layout'
import DashboardPage from './dashboard/dashboard-page'
import NotificationsPage from './users/notifications-page'
import CampaignsPage from './campaigns/campaigns-page'
import CampaignActivityPage from './campaigns/campaign-activity-page'
import CampaignContactsPage from './campaigns/campaign-contacts-page'
import ContactsPage from './contacts/contacts-page'
import ContactsImportPage from './contacts-import/contacts-import-page'
import ContactPage from './contacts/contact-page'
import SettingsPage from './users/settings/settings-page'
import NotFoundPage from './errors/not-found-page'

const Routes = ({ store, history }) => {
  return (
    <Router history={history}>
      <Route path='/' component={Layout}>
        <IndexRoute component={DashboardPage} />
        <Route path='notifications' component={NotificationsPage} />
        <Route path='campaigns' component={CampaignsPage} />
        <Route path='campaign'>
          <Route path=':slug'>
            <IndexRoute component={CampaignActivityPage} />
            <Route path='contacts' component={CampaignContactsPage} />
          </Route>
        </Route>
        <Route path='contacts'>
          <IndexRoute component={ContactsPage} />
          <Route path='import' component={ContactsImportPage} />
        </Route>
        <Route path='contact/:slug' component={ContactPage} />
        <Route path='settings' component={SettingsPage}>
          <Route path=':selected' component={SettingsPage} />
        </Route>
        <Route path='*' component={NotFoundPage} />
      </Route>
    </Router>
  )
}

export default Routes

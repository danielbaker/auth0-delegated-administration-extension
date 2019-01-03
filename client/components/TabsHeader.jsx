import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TabPane } from 'auth0-extension-ui';

export default class TabsHeader extends Component {
  static propTypes = {
    access: PropTypes.object,
    languageDictionary: PropTypes.object
  };

  render() {
    const languageDictionary = this.props.languageDictionary || {};

    return (
      <div className="widget-title title-with-nav-bars">
        <ul className="nav nav-tabs">
          <TabPane
            title={languageDictionary.userUsersTabTitle || 'Users'}
            route="users"
          />
          {this.props.access.canViewInvitedUsers() && (
            <TabPane
              title={languageDictionary.userLogsTabTitle || 'Invites'}
              route="invites"
            />
          )}
          {this.props.access.canAccessLogs() && (
            <TabPane
              title={languageDictionary.userLogsTabTitle || 'Logs'}
              route="logs"
            />
          )}
        </ul>
      </div>
    );
  }
}

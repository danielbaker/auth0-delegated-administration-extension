import React, { Component, PropTypes } from 'react';
import connectContainer from 'redux-static';
import moment from 'moment';

import { userActions } from '../../actions';
import TabsHeader from '../../components/TabsHeader';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { Error, LoadingPanel } from 'auth0-extension-ui';
import getErrorMessage from '../../utils/getErrorMessage';
import UserInfoField from '../../components/Users/UserInfoField';
import * as dialogs from './Dialogs';

export default connectContainer(class extends Component {
  static stateToProps = state => ({
    invite: state.invite.toJS(),
    log: state.log,
    logs: state.user.get('logs'),
    devices: state.user.get('devices'),
    settings: (state.settings.get('record') && state.settings.get('record')
      .toJS().settings) || {},
    languageDictionary: state.languageDictionary.get('record')
      .toJS() || {}
  });

  static actionsToProps = userActions;

  static propTypes = {
    languageDictionary: PropTypes.object.isRequired,
    access: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    invite: PropTypes.object.isRequired,
    params: PropTypes.object,
    fetchInvite: PropTypes.func.isRequired,
    requestCancelInvite: PropTypes.func.isRequired,
    requestResendInvite: PropTypes.func.isRequired,
    getDictValue: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.props.fetchInvite(this.props.params.id);
  }

  cancelInvite = async () => {
    await this.props.requestCancelInvite(this.props.params.id);
  };

  resendInvite = () => {
    this.props.requestResendInvite(this.props.params.id);
  };

  isHiddenField = (field) => {
    return [
      'id',
      'token',
      'isInvite'
    ].indexOf(field) >= 0;
  }

  formatFieldTitle(title) {
    return title.replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }

  formatFieldValue(val) {
    if (Array.isArray(val)) {
      return val.join(', ');
    }

    if (typeof val === 'object' || typeof val === 'boolean') {
      return JSON.stringify(val);
    }

    if (typeof val === 'string' && moment(val)
      .isValid()) {
      return moment(val)
        .fromNow();
    }

    return val;
  }

  render() {
    const { languageDictionary = {}, access, invite, settings } = this.props;
    const { loading = true, error, record = {} } = invite[ this.props.params.id ] || {};

    return (
      <div className="invite">
        <TabsHeader access={access} languageDictionary={languageDictionary}/>

        <div className="row content-header">
          <div className="col-xs-12">
            <h1 className="pull-left">{languageDictionary.inviteTitle || 'Invite Details'}</h1>
            <div className="pull-right">
              <DropdownButton bsStyle="success" title={languageDictionary.inviteActionsButton || 'Actions'}
                              id="invite-actions">
                <MenuItem disabled={loading || false} onClick={this.cancelInvite}>
                  {languageDictionary.cancelInviteMenuItemText || 'Cancel Invite'}
                </MenuItem>
                <MenuItem disabled={loading || false} onClick={this.resendInvite}>
                  {languageDictionary.resendInviteMenuItemText || 'Resend Invite'}
                </MenuItem>
              </DropdownButton>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12">
            <LoadingPanel show={loading} animationStyle={{ paddingTop: '5px', paddingBottom: '5px' }}>
              <Error title={languageDictionary.errorTitle}
                     message={getErrorMessage(languageDictionary, error, settings.errorTranslator)}/>
              <div className="user-info">
                {
                  Object.keys(record)
                    .filter(field => !this.isHiddenField(field))
                    .sort()
                    .map(field => (
                      <UserInfoField
                        key={field}
                        title={this.formatFieldTitle(field)}
                      >
                        {this.formatFieldValue(record[field])}
                      </UserInfoField>
                    ))
                }
              </div>
            </LoadingPanel>
          </div>
        </div>
        <dialogs.CancelInviteDialog />
        <dialogs.ResendInviteDialog />
      </div>
    );
  }
});

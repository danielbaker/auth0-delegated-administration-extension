import React, { Component } from 'react';
import PropTypes from 'prop-types';
import connectContainer from 'redux-static';
import { Error, Confirm } from 'auth0-extension-ui';

import { userActions } from '../../../actions';
import getDialogMessage from './getDialogMessage';
import { getName } from '../../../utils/display';
import getErrorMessage from '../../../utils/getErrorMessage';

export default connectContainer(class extends Component {
  static stateToProps = (state) => ({
    invite: state.invite.toJS(),
    inviteCancel: state.inviteCancel.toJS(),
    settings: (state.settings.get('record') && state.settings.get('record').toJS().settings) || {},
    languageDictionary: state.languageDictionary
  });

  static actionsToProps = {
    ...userActions
  }

  static propTypes = {
    invite: PropTypes.object.isRequired,
    inviteCancel: PropTypes.object.isRequired,
    cancelRequestCancelInvite: PropTypes.func.isRequired,
    cancelInvite: PropTypes.func.isRequired,
    fetchInvites: PropTypes.func.isRequired
  }

  onConfirm = () => {
    this.props.cancelInvite(this.props.inviteCancel.id);
  }

  render() {
    const { cancelRequestCancelInvite, settings } = this.props;
    const { id, error, requesting, loading } = this.props.inviteCancel;
    const { record: invite } = this.props.invite[id] || {};

    const userFields = settings.userFields || [];
    const languageDictionary = this.props.languageDictionary.get('record').toJS();

    const messageFormat = languageDictionary.resendVerificationEmailMessage ||
      'Do you really want to cancel the invitation to {username}?';

    const message = getDialogMessage(messageFormat, 'username',
      getName(invite, userFields, languageDictionary));

    return (
      <Confirm
        title={languageDictionary.cancelInvitationTitle || 'Cancel Invitation?' }
        show={requesting}
        loading={loading}
        confirmMessage={languageDictionary.dialogConfirmText}
        cancelMessage={languageDictionary.dialogCancelText}
        onCancel={cancelRequestCancelInvite}
        closeLabel={languageDictionary.closeButtonText}
        onConfirm={this.onConfirm}>
        <Error title={languageDictionary.errorTitle} message={getErrorMessage(languageDictionary, error, settings.errorTranslator)} />
        <p>
          {message}
        </p>
      </Confirm>
    );
  }
});

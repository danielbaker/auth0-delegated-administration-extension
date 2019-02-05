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
    inviteResend: state.inviteResend.toJS(),
    settings: (state.settings.get('record') && state.settings.get('record').toJS().settings) || {},
    languageDictionary: state.languageDictionary
  });

  static actionsToProps = {
    ...userActions
  }

  static propTypes = {
    invite: PropTypes.object.isRequired,
    inviteResend: PropTypes.object.isRequired,
    cancelRequestResendInvite: PropTypes.func.isRequired,
    resendInvite: PropTypes.func.isRequired
  }

  onConfirm = () => {
    this.props.resendInvite(this.props.inviteResend.id);
  }

  render() {
    const { cancelRequestResendInvite, settings } = this.props;
    const { id, error, requesting, loading } = this.props.inviteResend;
    const { record: invite } = this.props.invite[id] || {};

    const userFields = settings.userFields || [];
    const languageDictionary = this.props.languageDictionary.get('record').toJS();

    const messageFormat = languageDictionary.resendVerificationEmailMessage ||
      'Do you really want to resend the invitation to {username}?';

    const message = getDialogMessage(messageFormat, 'username',
      getName(invite, userFields, languageDictionary));

    return (
      <Confirm
        title={languageDictionary.resendInvitationTitle || 'Resend Invitation?' }
        show={requesting}
        loading={loading}
        confirmMessage={languageDictionary.dialogConfirmText}
        cancelMessage={languageDictionary.dialogCancelText}
        onCancel={cancelRequestResendInvite}
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

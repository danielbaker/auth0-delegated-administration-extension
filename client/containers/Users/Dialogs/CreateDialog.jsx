import React, { Component } from 'react';
import PropTypes from 'prop-types';
import connectContainer from 'redux-static';
import { Error } from 'auth0-extension-ui';
import { Modal } from 'react-bootstrap';

import permissions from "../../../utils/permissions";
import { userActions, scriptActions } from '../../../actions';
import { UserForm, ValidationError } from '../../../components/Users';
import getErrorMessage from '../../../utils/getErrorMessage';

export default connectContainer(class extends Component {
  static stateToProps = (state) => ({
    userCreate: state.userCreate,
    access: permissions(state.accessLevel),
    connections: state.connections,
    languageDictionary: state.languageDictionary,
    userForm: state.form
  });

  static actionsToProps = {
    ...userActions,
    ...scriptActions
  }

  static propTypes = {
    access: PropTypes.object.isRequired,
    connections: PropTypes.object.isRequired,
    userCreate: PropTypes.object.isRequired,
    userForm: PropTypes.object.isRequired,
    createUser: PropTypes.func.isRequired,
    inviteUser: PropTypes.func.isRequired,
    getDictValue: PropTypes.func.isRequired,
    cancelCreateUser: PropTypes.func.isRequired,
    userFields: PropTypes.array.isRequired,
    errorTranslator: PropTypes.func,
    languageDictionary: PropTypes.object
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.userCreate !== this.props.userCreate ||
      nextProps.languageDictionary !== this.props.languageDictionary ||
      nextProps.connections !== this.props.connections ||
      nextProps.access !== this.props.access ||
      nextProps.userFields !== this.props.userFields;
  }

  onSubmit = (user) => {
    const { record: { isInvite } } = this.props.userCreate.toJS();
    const languageDictionary = this.props.languageDictionary.get('record').toJS();
    if (isInvite) {
      this.props.inviteUser(user, languageDictionary);
    } else {
      this.props.createUser(user, languageDictionary);
    }
  };

  render() {
    const { error, loading, record } = this.props.userCreate.toJS();
    const connections = this.props.connections.toJS();
    const languageDictionary = this.props.languageDictionary.get('record').toJS();
    const isInvite = (record || {}).isInvite;

    return (
      <Modal show={record !== null} className="modal-overflow-visible" onHide={this.props.cancelCreateUser}>
        <Modal.Header closeButton={!loading} className="has-border" closeLabel={languageDictionary.closeButtonText} >
          <Modal.Title>{
            isInvite ?
              (languageDictionary.inviteDialogTitle || 'Invite User') :
              (languageDictionary.createDialogTitle || 'Create User')
          }</Modal.Title>
        </Modal.Header>

        <UserForm
          customFields={this.props.userFields || []}
          customFieldGetter={field => field.create}
          connections={connections.records} initialValues={record}
          createMemberships={this.props.access.canCreateMemberships()}
          memberships={this.props.access.memberships()}
          getDictValue={this.props.getDictValue}
          onClose={this.props.cancelCreateUser}
          onSubmit={this.onSubmit}
          loading={loading}
          languageDictionary={languageDictionary}
          isInvite={isInvite}
        >
          <Error title={languageDictionary.errorTitle} message={getErrorMessage(languageDictionary, error, this.props.errorTranslator)} />
          <ValidationError
            userForm={this.props.userForm}
            customFields={this.props.userFields || []}
            errorMessage={languageDictionary.validationError}
          />
        </UserForm>
      </Modal>
    );
  }
});

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Pagination, TableTotals } from 'auth0-extension-ui';

import { connectionActions, userActions } from '../../actions';
import permissions from '../../utils/permissions';

import * as dialogs from './Dialogs';
import TabsHeader from '../../components/TabsHeader';
import TableOverview from '../../components/Users/TableOverview';
import { GetUserFields } from '../../components/Users/Table';

import './Users.styles.css';

class Users extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    users: PropTypes.array,
    connections: PropTypes.array,
    userCreateError: PropTypes.string,
    userCreateLoading: PropTypes.bool,
    validationErrors: PropTypes.object,
    access: PropTypes.object,
    total: PropTypes.number,
    fetchUsers: PropTypes.func.isRequired,
    getDictValue: PropTypes.func.isRequired,
    fetchConnections: PropTypes.func.isRequired,
    requestCreateUser: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    sortOrder: PropTypes.number.isRequired,
    sortProperty: PropTypes.string.isRequired,
    searchValue: PropTypes.string,
    languageDictionary: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showCreateForm: false
    };
  }

  componentWillMount = () => {
    this.props.fetchUsers();
    this.props.fetchConnections();
  };

  onPageChange = (page) => {
    this.props.fetchUsers('', false, page - 1);
  };

  onSearch = (query, filterBy, onSuccess) => {
    if (query && query.length > 0) {
      this.props.fetchUsers(query, false, 0, filterBy, null, onSuccess);
    }
  };

  onReset = () => {
    this.props.fetchUsers('', true);
  };

  onColumnSort = (sort) => {
    this.props.fetchUsers('', false, 0, null, sort);
  };

  createUser = (isInvite) => {
    return () => {
      this.props.requestCreateUser(
        this.props.access.memberships(),
        isInvite
      );
    };
  };

  render() {
    const {
      loading,
      error,
      users,
      total,
      connections,
      access,
      nextPage,
      pages,
      settings,
      sortProperty,
      sortOrder,
      searchValue,
      languageDictionary
    } = this.props;

    const userFields = (settings && settings.userFields) || [];
    const originalTitle = (settings.dict && settings.dict.title) || window.config.TITLE || 'User Management';
    document.title = `${languageDictionary.userUsersTabTitle || 'Users'} - ${originalTitle}`;

    return (
      <div className="users">
        <TabsHeader
          languageDictionary={languageDictionary}
          access={access} />
        <div className="row content-header">
          <div className="col-xs-12 user-table-content">
            <h1>{languageDictionary.usersTitle || 'Users'}</h1>
            {(connections.length && access.canCreateUsers()) ?
              <button id="create-user-button" className="btn btn-success pull-right new" onClick={this.createUser(false)}>
                <i className="icon-budicon-473"></i>
                {languageDictionary.createUserButtonText || 'Create User'}
              </button>
              : ''}
            {connections.length && access.canInviteUsers() ?
              <button id="invite-user-button" className="btn btn-default pull-right new" onClick={this.createUser(true)}>
                <i className="icon-budicon-473"></i>
                {languageDictionary.inviteUserButtonText || 'Invite User'}
              </button>
              : ''}
          </div>
        </div>
        <dialogs.CreateDialog getDictValue={this.props.getDictValue} userFields={userFields} errorTranslator={settings && settings.errorTranslator} />
        <TableOverview
          onReset={this.onReset}
          onSearch={this.onSearch}
          onPageChange={this.onPageChange}
          error={error}
          rows={users}
          total={total}
          nextPage={nextPage}
          pages={pages}
          loading={loading}
          userFields={userFields}
          sortProperty={sortProperty}
          sortOrder={sortOrder}
          searchValue={searchValue}
          onColumnSort={this.onColumnSort}
          settings={settings}
          languageDictionary={languageDictionary}
          tableFields={GetUserFields(userFields)}
        />
        <div className="row">
          <div className="col-xs-12">
            {pages > 1 ?
              <Pagination
                totalItems={total}
                handlePageChange={this.onPageChange}
                perPage={10}
                textFormat={languageDictionary.paginationTextFormat}
              /> :
              <TableTotals currentCount={users.length} totalCount={total} textFormat={languageDictionary.tableTotalsTextFormat} />
            }
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    access: permissions(state.accessLevel),
    error: state.users.get('error'),
    userCreateError: state.userCreate.get('error'),
    userCreateLoading: state.userCreate.get('loading'),
    validationErrors: state.userCreate.get('validationErrors'),
    loading: state.users.get('loading'),
    users: state.users.get('records').toJS(),
    connections: state.connections.get('records').toJS(),
    total: state.users.get('total'),
    nextPage: state.users.get('nextPage'),
    pages: state.users.get('pages'),
    sortProperty: state.users.get('sortProperty'),
    sortOrder: state.users.get('sortOrder'),
    searchValue: state.users.get('searchValue'),
    settings: (state.settings.get('record') && state.settings.get('record').toJS().settings) || {},
    languageDictionary: state.languageDictionary.get('record').toJS()
  };
}

const UsersContainer = connect(mapStateToProps, { ...connectionActions, ...userActions })(Users);

export default UsersContainer;

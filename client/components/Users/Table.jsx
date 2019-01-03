import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';

import {
  Table as UITable,
  TableCell,
  TableRouteCell,
  TableBody,
  TableTextCell,
  TableHeader,
  TableColumn,
  TableRow
} from 'auth0-extension-ui';

import './Table.styles.css';
import { getValueForType } from '../../utils/display';


export function GetUserFields(userFields) {
  const defaultListFields = [
    {
      listOrder: 0,
      listSize: '6%',
      property: 'picture',
      type: 'picture',
      label: '',
      asText: (user) => user.name || user.user_name || user.email,
      display: (user) => user.picture || '',
      search: {
        sort: true
      }
    },
    {
      listOrder: 1,
      listSize: '20%',
      property: 'name',
      type: 'link',
      linkTo: (user) => `/users/${user.user_id}`,
      label: 'Name',
      display: (user) => (user.nickname || user.email || user.user_id),
      search: {
        sort: true
      }
    },
    {
      listOrder: 2,
      listSize: '29%',
      property: 'email',
      label: 'Email',
      display: (user) => user.email || 'N/A'
    },
    {
      listOrder: 3,
      listSize: '15%',
      property: 'last_login_relative',
      sortProperty: 'last_login',
      label: 'Latest Login',
      search: {
        sort: true
      }
    },
    {
      listOrder: 4,
      listSize: '15%',
      property: 'logins_count',
      label: 'Logins',
      search: {
        sort: true
      }
    }
  ];

  const connectionField = _.find(userFields, { property: 'connection' });
  if (!connectionField) {
    defaultListFields.push({
      listOrder: 5,
      listSize: '25%',
      property: 'identities',
      label: 'Connection',
      display: (user) => user.identities[0].connection
    });
  } else if (_.isFunction(connectionField.display) || (_.isBoolean(connectionField.display) && connectionField.display === true)) {
    defaultListFields.push({
      listOrder: 5,
      listSize: '25%',
      property: 'identities',
      label: 'Connection',
      display: (user) => (_.isFunction(connectionField.display) ? connectionField.display(user) : user.identities[0].connection)
    });
  }

  return addUserDefinedFields(defaultListFields, userFields);
}

export function GetInviteFields(userFields) {
  const defaultListFields = [
    {
      listOrder: 1,
      listSize: '25%',
      property: 'email',
      label: 'Email',
      search: {
        sort: true
      }
    },
    {
      listOrder: 2,
      listSize: '25%',
      property: 'createdAt',
      sortProperty: 'createdAt',
      label: 'Invited At',
      display: (invite) => moment(invite.createdAt).fromNow(),
      search: {
        sort: true
      }
    },
    {
      listOrder: 3,
      listSize: '25%',
      property: 'expiresAt',
      sortProperty: 'expiresAt',
      display: (invite) => moment(invite.expiresAt).fromNow(),
      label: 'Expires In',
      search: {
        sort: true
      }
    }
  ];

  return addUserDefinedFields(defaultListFields, userFields);
}

function addUserDefinedFields(listFields, userFields) {
  // Apply some customization
  if (userFields.length > 0) {
    // Figure out if we have any user list fields
    const customListFields = _(userFields)
      .filter(field => _.isObject(field.search) || (_.isBoolean(field.search) && field.search === true))
      .map((field) => {
        if (_.isBoolean(field.search) && field.search === true) {
          const defaultField = Object.assign({}, field, {
            listOrder: 1000,
            listSize: '25%'
          });
          return defaultField;
        }

        const customField = Object.assign({}, field, field.search);
        return customField;
      })
      .value();

    // If we do, allow the userFields to override the existing search fields
    if (Array.isArray(customListFields) && customListFields.length > 0) {
      // First filter out defaultListFields from userField entries
      const customFieldProperties = _(userFields)
        .filter(field => _.isObject(field.search) || (_.isBoolean(field.search) && field.search === true))
        .map('property')
        .value();

      listFields = _(listFields)
        .filter(field => customFieldProperties.indexOf(field.property) < 0)
        .concat(customListFields)
        .sortBy(field => field.listOrder)
        .filter(field => field.display !== false) // Remove any fields that have display set to false
        .value();
    }

    /* Now filter out any fields that are set to search === false, this should kill custom fields that are
     * overriding default fields
     */
    const falseSearchFields = _(userFields)
      .filter(field => field.search === false)
      .map('property')
      .value();

    listFields = _(listFields)
      .filter(field => falseSearchFields.indexOf(field.property) < 0)
      .value();
  }

  return listFields;
}

export default class Table extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    onColumnSort: PropTypes.func.isRequired,
    sortOrder: PropTypes.number.isRequired,
    sortProperty: PropTypes.string.isRequired,
    languageDictionary: PropTypes.object,
    fields: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
  }

  onColumnSort(property, sortOrder) {
    const sort = {
      property,
      order: sortOrder === -1 ? 1 : -1
    };
    this.props.onColumnSort(sort);
  }

  returnToSearch(event) {
    if (event && event.key === 'Enter') {
      event.target.click();
    }
  }

  render() {
    const { rows, loading, sortProperty, sortOrder } = this.props;

    const languageDictionary = this.props.languageDictionary || {};
    const labels = languageDictionary.labels || {};

    const listFields = this.props.fields;

    if (!rows.length && !loading) {
      return (
        <label className="search-no-results" tabIndex="0" htmlFor="search-bar" onKeyUp={this.returnToSearch}>
          {languageDictionary.userSearchNoResults || 'No results found by given parameters.'}
        </label>
      );
    }

    return (
      <UITable>
        <TableHeader>
          {
            listFields.map((field) => {
              const sort = _.isObject(field.search)
                && (_.isBoolean(field.search.sort) && field.search.sort === true);
              if (sort) {
                return (
                  <TableColumn key={field.property} width={field.listSize}>
                    <div className="table-column-div"
                         onClick={this.onColumnSort.bind(this, field.sortProperty || field.property, sortOrder)}>
                      {labels[field.property] || field.label}
                      {((field.sortProperty || field.property) === sortProperty) &&
                        <i
                          className={sortOrder === -1 ? 'icon-budicon-462 icon' : 'icon-budicon-460 icon'}
                          aria-hidden="true"
                        />
                      }
                    </div>
                  </TableColumn>
                );
              }

              return (
                <TableColumn key={field.property} width={field.listSize}>
                  {labels[field.property] || field.label}
                </TableColumn>
              );
            })
          }
        </TableHeader>
        <TableBody>
          {rows.map(row =>
            <TableRow key={row.id}>
              {
                listFields.map((field) => {
                  const key = `${row.id}_${field.property}`;
                  if (field.type === 'picture') {
                    return (
                      <TableCell>
                        <img
                          className="img-circle"
                          src={getValueForType('search', row, field, languageDictionary) || '(empty)'}
                          alt={field.asText(row)}
                          title={field.asText(row)}
                          width="32"
                        />
                      </TableCell>
                    );
                  }
                  if (field.type === 'link') {
                    return (
                      <TableRouteCell key={key} route={field.linkTo(row)}>
                        {getValueForType('search', row, field, languageDictionary) || '(empty)'}
                      </TableRouteCell>
                    );
                  }
                  return <TableTextCell key={key}>{getValueForType('search', row, field, languageDictionary)}</TableTextCell>;
                })
              }
            </TableRow>
          )}
        </TableBody>
      </UITable>
    );
  }
}

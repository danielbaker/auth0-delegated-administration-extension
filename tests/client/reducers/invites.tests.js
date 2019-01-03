import expect from 'expect';

import { invites } from '../../../client/reducers/invites';
import * as constants from '../../../client/constants';

const initialState = {
  loading: false,
  error: null,
  records: [],
  total: 0,
  currentPage: 1,
  pages: 1,
  searchValue: '',
  selectedFilter: '',
  sortProperty: 'email',
  sortOrder: -1
};

describe('invites reducer', () => {
  it('should return the initial state', () => {
    expect(
      invites(undefined, {})
        .toJSON()
    )
      .toEqual(
        initialState
      );
  });

  it('should handle FETCH_INVITES_PENDING', () => {
    expect(
      invites(initialState, {
        type: constants.FETCH_INVITES_PENDING,
        meta: {
          page: 0
        }
      }).toJSON()
    ).toEqual(
      {
        loading: true,
        error: null,
        records: [],
        currentPage: 1,
        pages: 1,
        total: 0,
        searchValue: undefined,
        selectedFilter: '',
        sortProperty: undefined,
        sortOrder: undefined
      }
    );
  });

  it('should handle FETCH_INVITES_PENDING a second time', () => {
    expect(
      invites({
        loading: false,
        error: null,
        pages: 2,
        records: [ 'test' ],
        total: 0
      }, {
        type: constants.FETCH_INVITES_PENDING,
        meta: {
          page: 1,
          searchValue: 'value',
          sortProperty: 'email',
          sortOrder: 1
        }
      }).toJSON()
    ).toEqual(
      {
        loading: true,
        error: null,
        records: [ 'test' ],
        total: 0,
        currentPage: 1,
        pages: 2,
        searchValue: 'value',
        selectedFilter: '',
        sortProperty: 'email',
        sortOrder: 1
      }
    );
  });

  it('should handle FETCH_INVITES_REJECTED', () => {
    expect(
      invites(initialState, {
        type: constants.FETCH_INVITES_REJECTED,
        errorData: {
          type: 'TEST',
          message: 'ERROR',
          status: 500
        }
      }).toJSON()
    ).toEqual(
      {
        loading: false,
        error: {
          type: 'TEST',
          message: 'ERROR',
          status: 500
        },
        records: [],
        total: 0,
        currentPage: 1,
        pages: 1,
        searchValue: '',
        selectedFilter: '',
        sortProperty: 'email',
        sortOrder: -1
      }
    );
  });

  it('should handle FETCH_INVITES_FULFILLED', () => {
    expect(
      invites(initialState, {
        type: constants.FETCH_INVITES_FULFILLED,
        payload: {
          data: {
            invites: [
              {
                id: 1,
                email: 'phoebe@dog.com'
              },
              {
                id: 2,
                email: 'lolly@dog.com'
              }
            ],
            total: 2
          }
        },
        meta: {
          page: 1
        }
      }).toJSON()
    ).toEqual(
      {
        loading: false,
        error: null,
        records: [
          {
            id: 1,
            email: 'phoebe@dog.com'
          },
          {
            id: 2,
            email: 'lolly@dog.com'
          }
        ],
        total: 2,
        nextPage: 2,
        currentPage: 1,
        pages: 1,
        searchValue: '',
        selectedFilter: undefined,
        sortProperty: 'email',
        sortOrder: -1
      }
    );
  });

});

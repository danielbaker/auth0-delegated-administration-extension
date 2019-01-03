import { fromJS } from 'immutable';

import * as constants from '../constants';
import createReducer from '../utils/createReducer';

const initialState = {
  loading: false,
  error: null,
  records: [],
  total: 0,
  currentPage: 1,
  pages: 1,
  selectedFilter: '',
  searchValue: '',
  sortProperty: 'email',
  sortOrder: -1
};

export const invites = createReducer(fromJS(initialState), { // eslint-disable-line import/prefer-default-export
  [constants.FETCH_INVITES_PENDING]: (state, action) =>
    state.merge({
      ...initialState,
      loading: true,
      records: action.meta.page === 0 ? [] : state.get('records'),
      pages: action.meta.page === 0 ? 1 : state.get('pages'),
      searchValue: action.meta.searchValue,
      sortProperty: action.meta.sortProperty,
      sortOrder: action.meta.sortOrder
    }),
  [constants.FETCH_INVITES_REJECTED]: (state, action) =>
    state.merge({
      loading: false,
      error: action.errorData
    }),
  [constants.FETCH_INVITES_FULFILLED]: (state, action) => {
    const { data } = action.payload;
    return state.merge({
      loading: false,
      total: data.total,
      pages: Math.ceil(data.total / 10),
      nextPage: action.meta.page + 1,
      selectedFilter: action.meta.selectedFilter,
      records: fromJS(data.invites)
    });
  }
});

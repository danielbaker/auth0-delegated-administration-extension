import { fromJS } from 'immutable';

import * as constants from '../constants';
import createReducer from '../utils/createReducer';

const initialState = {};

export const invite = createReducer(fromJS(initialState), { // eslint-disable-line import/prefer-default-export
  [constants.FETCH_INVITE_PENDING]: (state, action) =>
    state.merge({
      [action.meta.id]: {
        loading: true
      },
    }),
  [constants.FETCH_INVITE_REJECTED]: (state, action) =>
    state.merge({
      [action.meta.id]: {
        loading: false,
        error: action.errorData
      },
    }),
  [constants.FETCH_INVITE_FULFILLED]: (state, action) => {
    const { data } = action.payload;
    return state.merge({
      [action.meta.id]: {
        loading: false,
        error: null,
        record: data
      },
    });
  }
});

import { fromJS } from 'immutable';

import * as constants from '../constants';
import createReducer from '../utils/createReducer';

const initialState = {
  error: null,
  loading: false,
  requesting: false,
  id: null
};

export const inviteCancel = createReducer(fromJS(initialState), { // eslint-disable-line import/prefer-default-export
  [constants.REQUEST_CANCEL_INVITE]: (state, action) =>
    state.merge({
      ...initialState,
      id: action.id,
      requesting: true
    }),
  [constants.CANCEL_REQUEST_CANCEL_INVITE]: (state) =>
    state.merge({
      ...initialState
    }),
  [constants.CANCEL_INVITE_PENDING]: (state) =>
    state.merge({
      loading: true
    }),
  [constants.CANCEL_INVITE_REJECTED]: (state, action) =>
    state.merge({
      loading: false,
      error: action.errorData
    }),
  [constants.CANCEL_INVITE_FULFILLED]: (state) =>
    state.merge({
      ...initialState
    })
});

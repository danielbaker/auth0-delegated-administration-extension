import { fromJS } from 'immutable';

import * as constants from '../constants';
import createReducer from '../utils/createReducer';

const initialState = {
  error: null,
  loading: false,
  requesting: false,
  id: null
};

export const inviteResend = createReducer(fromJS(initialState), { // eslint-disable-line import/prefer-default-export
  [constants.REQUEST_RESEND_INVITE]: (state, action) =>
    state.merge({
      ...initialState,
      id: action.id,
      requesting: true
    }),
  [constants.CANCEL_REQUEST_RESEND_INVITE]: (state) =>
    state.merge({
      ...initialState
    }),
  [constants.RESEND_INVITE_PENDING]: (state) =>
    state.merge({
      loading: true
    }),
  [constants.RESEND_INVITE_REJECTED]: (state, action) =>
    state.merge({
      loading: false,
      error: action.errorData
    }),
  [constants.RESEND_INVITE_FULFILLED]: (state) =>
    state.merge({
      ...initialState
    })
});

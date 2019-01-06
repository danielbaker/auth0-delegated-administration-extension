import { UnauthorizedError } from 'auth0-extension-tools';
import moment from 'moment';

import { decodeInviteUrlToken } from '../inviteTokens';
import logger from '../logger';

/**
 * Validates the invite token within the authorization header.
 * Populates req.invite with the invite if valid.
 */

export default (scriptManager) => async (req, res, next) => {
  if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') !== 0) {
    return next(new UnauthorizedError('Authentication required for this endpoint.'));
  }

  let decodedToken;
  try {
    const encodedToken = req.headers.authorization.split(' ')[1];
    decodedToken = decodeInviteUrlToken(encodedToken);
  } catch (e) {
    logger.error(e);
    return next(new UnauthorizedError('Invalid token supplied'));
  }

  const inviteContext = {
    method: 'fetch-invite',
    payload: {
      email: decodedToken.email
    }
  };

  try {
    const invite = await scriptManager.execute('invites', inviteContext);
    if (!invite) {
      return next(new UnauthorizedError('Invite token not found'));
    }

    if (invite.token !== decodedToken.token) {
      return next(new UnauthorizedError('Invite token not found'));
    }

    if (moment(invite.expiresAt)
      .isBefore(moment())) {
      return next(new UnauthorizedError('Invite has expired'));
    }

    req.invite = invite;
  } catch (e) {
    logger.error(e);
    return next(new UnauthorizedError('Error validating invite token'));
  }

  return;
};

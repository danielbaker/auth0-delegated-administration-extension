import { UnauthorizedError } from 'auth0-extension-tools';
import moment from 'moment';

import { decodeInviteUrlToken } from '../inviteTokens';
import logger from '../logger';

const verifyToken = async (scriptManager, req) => {
  let decodedToken;
  try {
    const encodedToken = req.params.token;
    decodedToken = decodeInviteUrlToken(encodedToken);
  } catch (e) {
    logger.error(e);
    throw new UnauthorizedError('Invalid token supplied');
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
      throw new UnauthorizedError('Invite token not found');
    }

    if (invite.token !== decodedToken.token) {
      throw new UnauthorizedError('Invite token not found');
    }

    if (moment(invite.expiresAt)
      .isBefore(moment())) {
      throw new UnauthorizedError('Invite has expired');
    }

    req.invite = invite;
  } catch (e) {
    throw new UnauthorizedError(`Error validating invite token: ${e}`);
  }
};

/**
 * Validates the invite token within the authorization header.
 * Populates req.invite with the invite if valid.
 * Populates req.error with with an error message if invite is not valid.
 */

export default scriptManager => async (req, res, next) => {
  try {
    await verifyToken(scriptManager, req);
  } catch (e) {
    logger.error(`accept invitation error: ${e.message}`);
    req.error = e.message;
  }

  next();
};

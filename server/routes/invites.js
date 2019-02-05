import { Router } from 'express';
import { ValidationError } from 'auth0-extension-tools';
import moment from 'moment';
import uuid from 'uuid';
import base64url from 'base64url';

import { checkCustomFieldValidation } from './users';
import { generateInviteUrl } from '../lib/inviteTokens';

export default (emailer, scriptManager) => {

  const sendInvitationEmail = async (invite, settings) => {
    const emailSettings = settings && settings.email || {};

    invite.invitationUrl = generateInviteUrl(invite.email, invite.token);
    const template = await scriptManager.loadTemplate('invitationEmail', invite);
    return emailer.send(
      invite.email,
      emailSettings.fromAddress || 'no-reply@auth0.com',
      emailSettings.inviteSubject || 'Invitation Received',
      template
    )
  };

  const api = Router();

  /*
   * Send a user invitation.
   */
  api.post('/', (req, res, next) => {
    const existingInviteConext = {
      method: 'fetch-invite',
      request: {
        user: req.user
      },
      payload: {
        email: req.body.email
      }
    };

    scriptManager.execute('invites', existingInviteConext)
      .then((existingInvite) => {
        if (existingInvite) {
          return next(new ValidationError('Invitation already exists for this email address.'));
        }

        const settingsContext = {
          request: {
            user: req.user
          },
          locale: req.headers['dae-locale']
        };

        return scriptManager.execute('settings', settingsContext)
          .then((settings) => {
            const userFields = settings && settings.userFields;
            const emailSettings = settings && settings.email || {};
            const inviteSettings = settings && settings.invites || {};
            const invitationExpiryTimeout = inviteSettings.expiryLength || 604800; // default 7 days

            // TODO: ensure user is allowed to create invite

            const inviteContext = {
              method: 'store-new-invite',
              request: {
                user: req.user
              },
              payload: {
                email: req.body.email,
                connection: req.body.connection,
              },
              userFields
            };

            try {
              inviteContext.payload = checkCustomFieldValidation(req, inviteContext);
            } catch (e) {
              return next(e);
            }

            if (!inviteContext.payload.email || inviteContext.payload.email.length === 0) {
              return next(new ValidationError('The email address is required.'));
            }

            inviteContext.payload.id = base64url.encode(uuid.v4());
            inviteContext.payload.invitedBy = req.user.email;
            inviteContext.payload.token = uuid.v4();
            inviteContext.payload.createdAt = moment();
            inviteContext.payload.expiresAt = moment().add(invitationExpiryTimeout, 'seconds');

            // TODO: validate memberships are allowed
            if (req.body.memberships && Array.isArray(req.body.memberships)) {
              inviteContext.payload.memberships = req.body.memberships.map(m => m.value);
            }

            return scriptManager.execute('invites', inviteContext)
              .then((payload) => sendInvitationEmail(payload, settings))
              .then(() => res.status(201).send())
              .catch(next);
          });
      });
  });

  /*
   * Fetch all invitations
   */
  api.get('/', (req, res, next) => {
    const invitesContext = {
      method: 'fetch-invites',
      request: {
        user: req.user
      },
      payload: {
        search: req.query.search,
        sortProperty: req.query.sortProperty,
        sortOrder: req.query.sortOrder,
        perPage: req.query.per_page || 10,
        page: req.query.page || 0
      }
    };

    // TODO: ensure user is allowed to fetch invites

    return scriptManager.execute('invites', invitesContext)
      .then(invites => res.json(invites))
      .catch(err => next(err));
  });

  /*
   * Fetch an invitation
   */
  api.get('/:id', (req, res, next) => {
    const invitesContext = {
      method: 'fetch-invite',
      request: {
        user: req.user
      },
      payload: {
        id: req.params.id
      }
    };

    // TODO: ensure user is allowed to fetch invite

    return scriptManager.execute('invites', invitesContext)
      .then(invite => res.json(invite))
      .catch(err => next(err));
  });

  api.post('/cancel/:id', (req, res, next) => {
    const invitesContext = {
      method: 'delete-invite',
      request: {
        user: req.user
      },
      payload: {
        id: req.params.id
      }
    };

    // TODO: ensure user is allowed to cancel invite

    return scriptManager.execute('invites', invitesContext)
      .then(() => res.send())
      .catch(err => next(err));
  });


  api.post('/resend/:id', async (req, res, next) => {
    const invitesContext = {
      method: 'fetch-invite',
      request: {
        user: req.user
      },
      payload: {
        id: req.params.id
      }
    };

    const settingsContext = {
      request: {
        user: req.user
      },
      locale: req.headers['dae-locale']
    };

    // TODO: ensure user is allowed to resend invite

    try {
      const settings = await scriptManager.execute('settings', settingsContext);
      const invite = await scriptManager.execute('invites', invitesContext);
      await sendInvitationEmail(invite, settings);
      res.send();
    } catch (err) {
      next(err);
    }
  });

  return api;
};

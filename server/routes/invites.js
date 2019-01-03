import { Router } from 'express';
import { ValidationError } from 'auth0-extension-tools';
import moment from 'moment';
import uuid from 'uuid';
import { checkCustomFieldValidation } from './users';

export default (emailer, scriptManager) => {
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
            const inviteContext = {
              method: 'store-new-invite',
              request: {
                user: req.user
              },
              payload: req.body,
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

            inviteContext.payload.id = uuid.v4();
            inviteContext.payload.invitedBy = req.user.email;
            inviteContext.payload.token = uuid.v4();
            inviteContext.payload.createdAt = moment();
            inviteContext.payload.expiresAt = moment().add(invitationExpiryTimeout, 'seconds');

            return scriptManager.execute('invites', inviteContext)
              .then((payload) => {
                inviteContext.payload = payload;
                return scriptManager.loadTemplate('invitation_email', payload);
              })
              .then(emailTemplate =>
                emailer.send(
                  inviteContext.payload.email,
                  emailSettings.fromAddress || 'no-reply@auth0.com',
                  emailSettings.inviteSubject || 'Invitation Received',
                  emailTemplate
                ))
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

    return scriptManager.execute('invites', invitesContext)
      .then(invites => res.json(invites))
      .catch(err => next(err));
  });

  return api;
};

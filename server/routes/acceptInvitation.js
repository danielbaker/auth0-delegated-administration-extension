import { Router } from 'express';

import getLocale from '../lib/getLocale';
import config from '../lib/config';

export default (scriptManager) => {
  const api = Router();

  api.get('/', async (req, res, next) => {
    const acceptInvitationContext = {
      invite: req.invite,
      error: req.error,
      settings: {
        favIcon: config('FAVICON_PATH') || 'https://cdn.auth0.com/styleguide/4.6.13/lib/logos/img/favicon.png',
        customCss: config('CUSTOM_CSS'),
        locale: getLocale(req)
      }
    };

    const template = await scriptManager.loadTemplate('acceptInvitation', acceptInvitationContext);
    res.send(template);
  });

  return api;
};

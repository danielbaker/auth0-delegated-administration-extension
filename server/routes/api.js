import { Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { middlewares } from 'auth0-extension-express-tools';
import tools from 'auth0-extension-tools';

import { requireScope } from '../lib/middlewares';
import config from '../lib/config';


import Emailer from '../lib/emailer';
import getScopes from '../lib/getScopes';
import * as constants from '../constants';

import applications from './applications';
import connections from './connections';
import scripts from './scripts';
import me from './me';
import logs from './logs';
import users from './users';
import invites from './invites';

export default (scriptManager) => {
  const managementApiClientMiddlerware = middlewares.managementApiClient({
    domain: config('AUTH0_ISSUER_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET')
  });

  const managementApiClient = tools.managementApi.getClient({
    domain: config('AUTH0_ISSUER_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET')
  });

  const emailer = new Emailer(managementApiClient);

  const api = Router();

  const getToken = req => _.get(req, 'headers.authorization', '').split(' ')[1];

  const addExtraUserInfo = (token, user) => {
    global.daeUser = global.daeUser || {};
    global.daeUser[user.sub] = global.daeUser[user.sub] || { exp: 0, token: '' };

    if (_.isFunction(global.daeUser[user.sub].then)) {
      return global.daeUser[user.sub];
    }

    if (global.daeUser[user.sub].exp > moment().unix() && token &&
      global.daeUser[user.sub].token === token) {
      _.assign(user, global.daeUser[user.sub]);
      return Promise.resolve(user);
    }

    if (!token) console.error('no token found');

    const promise = managementApiClient.then(auth0 =>
        auth0.users.get({ id: user.sub })
          .then(userData => {
            _.assign(user, userData);
            user.token = token;
            global.daeUser[user.sub] = user;
            return user;
          })
      );

    global.daeUser[user.sub] = promise;

    return global.daeUser[user.sub];
  };

  // Allow end users to authenticate.
  api.use(middlewares.authenticateUsers.optional({
    domain: config('AUTH0_ISSUER_DOMAIN'),
    audience: config('EXTENSION_CLIENT_ID'),
    credentialsRequired: false,
    onLoginSuccess: (req, res, next) => {
      const currentRequest = req;
      return addExtraUserInfo(getToken(req), req.user)
        .then((user) => {
          currentRequest.user = user;
          currentRequest.user.scope = getScopes(req.user);
          return next();
        })
        .catch(next);

    }
  }));

  // Allow dashboard admins to authenticate.
  api.use(middlewares.authenticateAdmins.optional({
    credentialsRequired: false,
    secret: config('EXTENSION_SECRET'),
    audience: 'urn:delegated-admin',
    baseUrl: config('PUBLIC_WT_URL'),
    onLoginSuccess: (req, res, next) => {
      const currentRequest = req;
      return addExtraUserInfo(getToken(req), req.user)
        .then((user) => {
          currentRequest.user = user;
          currentRequest.user.scope = [constants.AUDITOR_PERMISSION, constants.USER_PERMISSION, constants.ADMIN_PERMISSION];
          return next();
        })
        .catch(next);
    }
  }));

  /* Fight caching attempts by IE */
  api.use((req, res, next) => {
    res.setHeader('Cache-control', 'no-cache, no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  api.use((req, res, next) => {
    const permission = (req.method.toLowerCase() === 'get') ? constants.AUDITOR_PERMISSION : constants.USER_PERMISSION;
    return requireScope(permission)(req, res, next);
  });
  api.use('/applications', managementApiClientMiddlerware, applications());
  api.use('/connections', managementApiClientMiddlerware, connections(scriptManager));
  api.use('/scripts', requireScope(constants.ADMIN_PERMISSION), scripts(scriptManager));
  api.use('/users', managementApiClientMiddlerware, users(scriptManager));
  api.use('/invites', invites(emailer, scriptManager));
  api.use('/logs', managementApiClientMiddlerware, logs(scriptManager));
  api.use('/me', me(scriptManager));
  api.get('/settings', (req, res, next) => {
    const settingsContext = {
      request: {
        user: req.user
      },
      locale: req.headers['dae-locale']
    };

    scriptManager.execute('settings', settingsContext)
      .then(settings => res.json({ settings: settings || {} }))
      .catch(next);
  });

  return api;
}
;

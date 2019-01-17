import _ from 'lodash';
import { Router } from 'express';

import multipartRequest from '../lib/multipartRequest';

export default (scriptManager) => {
  const api = Router();
  api.get('/', async (req, res, next) => {
    try {
      const connections = await multipartRequest(req.auth0, 'connections', {
        fields: 'id,name,strategy,options'
      });
      global.connections = connections;
      const databaseConnections = connections.filter(conn => conn.strategy === 'auth0');
      const federatedConnections =  connections.filter(conn => conn.options && (conn.options.domain || conn.options.domain_aliases));
      const federatedDomains = federatedConnections.reduce((domains, conn) => {
        const c = { id: conn.id, name: conn.name };
        if (conn.options.domain) domains[conn.options.domain] = c;
        (conn.options.domain_aliases || []).forEach(alias => domains[alias] = c);
        return domains;
      }, {});

      const settingsContext = {
        request: {
          user: req.user
        },
        locale: req.headers[ 'dae-locale' ]
      };
      const settings = await scriptManager.execute('settings', settingsContext);

      let filteredDatabaseConnections = _.chain(databaseConnections)
        .sortBy(conn => conn.name.toLowerCase())
        .value();
      if (settings && settings.connections && Array.isArray(settings.connections) && settings.connections.length) {
        filteredDatabaseConnections = filteredDatabaseConnections.filter(conn => (settings.connections.indexOf(conn.name) >= 0));
      }

      let filteredFederatedDomains = federatedDomains;
      if (settings && settings.federatedConnections && Array.isArray(settings.federatedConnections) && settings.federatedConnections.length) {
        filteredFederatedDomains = Object.keys(federatedDomains)
          .filter(domain => settings.federatedConnections.indexOf(federatedDomains[domain].name) >= 0)
          .reduce((domains, domain) => {
            domains[domain] = federatedDomains[domain];
            return domains;
          }, {});
      }


      res.json({
        dbConnections: filteredDatabaseConnections,
        federatedDomains: filteredFederatedDomains
      });
    } catch (e) {
      next(e);
    }
  });

  return api;
};

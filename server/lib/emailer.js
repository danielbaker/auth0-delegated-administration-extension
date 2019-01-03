const nodemailer = require('nodemailer');
const mandrillTransport = require('nodemailer-mandrill-transport');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const sesTransport = require('nodemailer-ses-transport');
const sparkpostTransport = require('nodemailer-sparkpost-transport');
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const memoizer = require('lru-memoizer');
const Promise = require('bluebird');
const log = require('./logger');

export default class Emailer {
  constructor(managementAPI) {
    this.getAuth0 = managementAPI;
    this.defaultFromAddress = 'no-reply@auth0.com';
  }

  providerTypeMapper = {
    mandrill: mandrillSettings => nodemailer.createTransport(mandrillTransport({ auth: { apiKey: mandrillSettings.credentials.api_key } })),
    sendgrid: sendgridSettings => nodemailer.createTransport(sendgridTransport({ auth: { api_key: sendgridSettings.credentials.api_key } })),
    ses: sesSettings => nodemailer.createTransport(sesTransport({
      accessKeyId: sesSettings.credentials.accessKeyId,
      secretAccessKey: sesSettings.credentials.secretAccessKey,
      region: sesSettings.credentials.region
    })),
    smtp: smtpSettings => nodemailer.createTransport({
      host: smtpSettings.credentials.smtp_host,
      port: smtpSettings.credentials.smtp_port,
      auth: {
        user: smtpSettings.credentials.smtp_user,
        pass: smtpSettings.credentials.smtp_pass
      },
      authMethod: 'LOGIN',
      socketTimeout: 20 * 1000,
      pool: true,
      maxConnections: 1
    }),
    sparkpost: sparkpostSettings => nodemailer.createTransport(sparkpostTransport({ sparkPostApiKey: sparkpostSettings.credentials.api_key }))
  };

  // Call the Auth0 management API to get the configured mail provider
  emailProvider = () => {
    return this.getAuth0.then((auth0) => {
      return new Promise((resolve, reject) => {
        auth0.emailProvider.get({
          fields: 'name,enabled,credentials,settings,default_from_address'
        }, (err, providerSettings) => {
          if (err) {
            throw err;
          }

          if (!providerSettings || !providerSettings.name) {
            throw new Error('A mail provider must be configured in the auth0 tenant');
          }

          if (!this.providerTypeMapper[providerSettings.name]) {
            throw new Error(`Unknown mail provider: ${providerSettings.name}`);
          }

          const provider = this.providerTypeMapper[providerSettings.name](providerSettings);
          provider.use('compile', htmlToText({}));
          resolve(provider);
        });
      });
    });
  };

  // cache the email provider for 5 seconds.
  // We don't want to create a new provider each time, because it requires a management API call.
  // We don't want to cache for too long, because then provider config changes won't take effect when updated.
  cachedEmailProvider = Promise.promisify(
      memoizer({
        load: (callback) => {
          this.emailProvider()
            .then((provider) => {
              callback(null, provider);
            })
            .catch(callback);
        },
        hash: () => 'emailProvider',
        maxAge: 5000 // 5 seconds
      })
    );

  send = (to, from, subject, html) => {
    return this.cachedEmailProvider().then((transport) => {
      return new Promise((resolve, reject) => {
        transport.sendMail({ to, from, subject, html }, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          log.debug(`email sent successfully: ${JSON.stringify(result)}`);
          resolve();
        });
      });
    });
  }

}

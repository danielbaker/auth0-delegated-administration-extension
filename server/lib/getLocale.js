import { urlHelpers } from 'auth0-extension-express-tools';
import url from 'url';

export default (req) => {
  const basePath = urlHelpers.getBasePath(req);
  const pathname = url.parse(req.originalUrl).pathname;
  const relativePath = pathname.replace(basePath, '').split('/');
  const routes = [
    'api',
    'login',
    'logs',
    'configuration',
    'users'
  ];
  if (routes.indexOf(relativePath[0]) < 0 && relativePath[0] !== '') {
    return relativePath[0];
  }

  return (req.cookies && req.cookies['dae-locale']) || 'en';
};

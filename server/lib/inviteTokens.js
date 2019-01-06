import base64url from 'base64url';
import config from './config';

export function generateInviteUrl(email, token) {
  const baseURL = config('PUBLIC_WT_URL');
  const tokenContents = { email, token };
  const urlToken = base64url.encode(JSON.stringify(tokenContents));

  return `${baseURL}/invitation/${urlToken}`;
}

export function decodeInviteUrlToken(encodedToken) {

  const decodedToken = base64url.decode(encodedToken);
  return JSON.parse(decodedToken);
}

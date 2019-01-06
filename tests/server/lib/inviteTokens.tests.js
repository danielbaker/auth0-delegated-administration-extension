import expect from 'expect';

import { generateInviteUrl, decodeInviteUrlToken } from '../../../server/lib/inviteTokens';
import config from '../../../server/lib/config';

describe('#inviteTokens', () => {
  const email = 'phoebe@dog.com';
  const token = 'c77372f9-cab2-4b9e-9301-0b4edd3e4dc9';
  const encodedToken = 'eyJlbWFpbCI6InBob2ViZUBkb2cuY29tIiwidG9rZW4iOiJjNzczNzJmOS1jYWIyLTRiOWUtOTMwMS0wYjRlZGQzZTRkYzkifQ';

  beforeEach(() => {
    config.setValue('PUBLIC_WT_URL', 'http://test.com');
  });

  it('generates a token successfully', () => {
    expect(generateInviteUrl(email, token)).toEqual(`http://test.com/invitation/${encodedToken}`);
  });

  it('decodes an encoded token successfully', () => {
    expect(decodeInviteUrlToken(encodedToken)).toEqual({ email, token });
  });
});

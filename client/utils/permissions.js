export const AUDITOR_PERMISSION = 'read:users';
export const USER_PERMISSION = 'manage:users';
export const ADMIN_PERMISSION = 'manage:config';
export const INVITE_PERMISSION = 'invite:users';

class Permissions {
  constructor(accessLevel) {
    this.accessLevel = accessLevel.record || {};
  }

  canManageConfiguration() {
    return this.accessLevel.permissions.includes(ADMIN_PERMISSION);
  }

  canAccessLogs() {
    return this.accessLevel.permissions.includes(ADMIN_PERMISSION);
  }

  canManageUsers() {
    return this.accessLevel.permissions.includes(USER_PERMISSION);
  }

  canCreateUsers() {
    return this.accessLevel.permissions.includes(USER_PERMISSION);
  }

  canViewInvitedUsers() {
    return this.accessLevel.permissions.includes(INVITE_PERMISSION);
  }

  canInviteUsers() {
    return this.accessLevel.permissions.includes(INVITE_PERMISSION);
  }

  canCreateMemberships() {
    return this.accessLevel.createMemberships;
  }

  memberships() {
    return this.accessLevel.memberships;
  }
}

export default (accessLevel) => {
  return new Permissions(accessLevel.toJS());
};

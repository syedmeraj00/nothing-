// Role-Based Access Control System
export const ROLES = {
  ADMIN: 'admin',
  ESG_MANAGER: 'esg_manager',
  DATA_ANALYST: 'data_analyst',
  AUDITOR: 'auditor',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  CREATE_DATA: 'create_data',
  EDIT_DATA: 'edit_data',
  DELETE_DATA: 'delete_data',
  VIEW_REPORTS: 'view_reports',
  APPROVE_DATA: 'approve_data',
  MANAGE_USERS: 'manage_users',
  EXPORT_DATA: 'export_data'
};

const rolePermissions = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ESG_MANAGER]: [PERMISSIONS.CREATE_DATA, PERMISSIONS.EDIT_DATA, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.APPROVE_DATA, PERMISSIONS.EXPORT_DATA],
  [ROLES.DATA_ANALYST]: [PERMISSIONS.CREATE_DATA, PERMISSIONS.EDIT_DATA, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.EXPORT_DATA],
  [ROLES.AUDITOR]: [PERMISSIONS.VIEW_REPORTS, PERMISSIONS.APPROVE_DATA],
  [ROLES.VIEWER]: [PERMISSIONS.VIEW_REPORTS]
};

export class RBACManager {
  static hasPermission(userRole, permission) {
    return rolePermissions[userRole]?.includes(permission) || false;
  }

  static canAccess(userRole, requiredPermissions) {
    return requiredPermissions.every(permission => 
      this.hasPermission(userRole, permission)
    );
  }

  static getUserPermissions(userRole) {
    return rolePermissions[userRole] || [];
  }
}
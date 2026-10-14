export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  VENDOR: 'VENDOR',
  USER: 'USER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const AUTH_MODES = {
  PASSWORD: 'password',
  OTP: 'otp',
} as const;

export type AuthMode = (typeof AUTH_MODES)[keyof typeof AUTH_MODES];

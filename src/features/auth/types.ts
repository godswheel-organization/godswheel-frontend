// TODO(backend): replace with the real auth contract once the Godswheel API spec is available.
export interface SignInRequest {
  email: string;
  password: string;
}

// POST /auth/signup (GodsWheel API). Field names are the API's own.
export interface SignUpRequest {
  full_name: string;
  email: string;
  password: string;
  accepted_terms: true;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
}

// The API wraps every success as { success: true, data }.
export interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface SignUpResult {
  message: string;
  user: PublicUser;
}

// POST /auth/login and POST /auth/verify-email. The token has no expiry and there's no refresh: it lasts until
// POST /auth/logout revokes it.
export interface LoginResult {
  user: PublicUser;
  accessToken: string;
  tokenType: "Bearer";
  // ISO time the token was issued.
  issuedAt: string;
}

// POST /auth/verify-email: the single-use token from the verification link.
export interface TokenRequest {
  token: string;
}

export interface EmailRequest {
  email: string;
}

// POST /auth/reset-password: the token from the reset email, and the new password (8 to 72 characters).
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

// The form's values; authApi.changePassword sends them as PUT /auth/change-password's current_password / new_password.
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSession {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

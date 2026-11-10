// TODO(backend): replace with the real auth contract once the Godswheel API spec is available.
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termsAccepted: true;
}

export interface PasswordResetRequest {
  email: string;
}

export interface AuthSession {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

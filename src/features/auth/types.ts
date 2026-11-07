// TODO(backend): replace with the real auth contract once the Godswheel API spec is available.
export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  role: string;
}

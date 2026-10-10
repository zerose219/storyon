export interface SignupRequest {
  nickname: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  user_id: number;
  nickname: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  nickname: string;
  email: string;
  message: string;
}
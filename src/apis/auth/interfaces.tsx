export interface userLoginRequest {
  email: string;
  password: string;
}


export interface userLoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'admin' | 'user';
    };
    token: string;
  };
}
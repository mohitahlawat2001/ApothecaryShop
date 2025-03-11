import { createContext } from 'react';

export const AuthContext = createContext({
  auth: {
    token: null,
    isAuthenticated: false,
    user: null
  },
  setAuth: () => {},
  getBearerToken: () => {}
});

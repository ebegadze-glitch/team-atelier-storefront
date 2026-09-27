const TOKEN_KEY = "accessToken";

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

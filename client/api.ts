export const apiClient: Record<string, (...args: any[]) => Promise<any>> = new Proxy({}, {
  get: () => async () => ({}),
});

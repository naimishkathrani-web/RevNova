import { create } from 'zustand';

const defaultConnection = {
  instanceUrl: '',
  username: '',
  apiVersion: 'v58.0',
  isConnected: false
};

export const useConnectionStore = create((set) => ({
  source: defaultConnection,
  target: defaultConnection,
  setSourceConnection: (data) =>
    set((state) => ({ source: { ...state.source, ...data } })),
  setTargetConnection: (data) =>
    set((state) => ({ target: { ...state.target, ...data } })),
  resetConnections: () => set({ source: defaultConnection, target: defaultConnection })
}));
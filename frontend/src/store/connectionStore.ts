// frontend/src/store/connectionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Connection data structure
interface ConnectionData {
  instanceUrl: string;
  username: string;
  apiVersion: string;
  isConnected: boolean;
}

// Store state
interface ConnectionState {
  source: ConnectionData;
  target: ConnectionData;
  setSourceConnection: (data: Partial<ConnectionData>) => void;
  setTargetConnection: (data: Partial<ConnectionData>) => void;
  resetConnections: () => void;
}

// Default values
const defaultConnection: ConnectionData = {
  instanceUrl: "",
  username: "",
  apiVersion: "v58.0",
  isConnected: false,
};

// Create store
export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      source: defaultConnection,
      target: defaultConnection,

      setSourceConnection: (data: Partial<ConnectionData>) =>
        set((state) => ({ source: { ...state.source, ...data } })),

      setTargetConnection: (data: Partial<ConnectionData>) =>
        set((state) => ({ target: { ...state.target, ...data } })),

      resetConnections: () =>
        set({ source: defaultConnection, target: defaultConnection }),
    }),
    {
      name: "connection-storage", // key in localStorage
    }
  )
);

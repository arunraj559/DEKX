import { LeaveRequest } from "./types";

const STORAGE_KEYS = {
  REQUESTS: "leave_requests",
  SETTINGS: "dashboard_settings"
};

const DEFAULT_SETTINGS = {
  approverEmails: "arunraj170845@gmail.com",
  adminPassword: "TVTOTO098",
  maxAdvanceDays: "60"
};

export const mockStorage = {
  getRequests: (): LeaveRequest[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading requests", e);
      return [];
    }
  },

  saveRequest: (request: Omit<LeaveRequest, "id" | "createdAt">): LeaveRequest => {
    const requests = mockStorage.getRequests();
    const newRequest: LeaveRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([newRequest, ...requests]));
    return newRequest;
  },

  updateRequestStatus: (id: string, status: 'APPROVED' | 'REJECTED'): LeaveRequest | null => {
    const requests = mockStorage.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    requests[index].status = status;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return requests[index];
  },

  deleteRequest: (id: string): void => {
    const requests = mockStorage.getRequests();
    const filtered = requests.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(filtered));
  },

  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (e) {
      console.error("Error reading settings", e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: any) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }
};

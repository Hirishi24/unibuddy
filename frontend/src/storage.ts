export interface Profile {
  name?: string;
  regNo?: string;
  program?: string;
  semester?: string;
  [key: string]: any;
}

export interface ScrapedData {
  profile: Profile;
  attendance: any[];
  timetable: any[];
  subjects: any[];
  cgpa: any;
  source: string;
  lastUpdated: string;
}

const KEYS = {
  SESSION: 'unibuddy_session',
  DATA: 'unibuddy_scraped_data',
  PROFILE: 'unibuddy_profile',
};

export const getStoredSession = () => {
  const session = localStorage.getItem(KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

export const setStoredSession = (session: { accessToken: string; sessionId: string; sessionTime: string }) => {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
};

export const clearStoredSession = () => {
  localStorage.removeItem(KEYS.SESSION);
  localStorage.removeItem(KEYS.DATA);
  localStorage.removeItem(KEYS.PROFILE);
};

export const getStoredData = (): ScrapedData | null => {
  const data = localStorage.getItem(KEYS.DATA);
  return data ? JSON.parse(data) : null;
};

export const setStoredData = (data: Partial<ScrapedData>) => {
  const existing = getStoredData() || {};
  const updated = {
    ...existing,
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(KEYS.DATA, JSON.stringify(updated));
};

export const getStoredProfile = (): Profile | null => {
  const profile = localStorage.getItem(KEYS.PROFILE);
  return profile ? JSON.parse(profile) : null;
};

export const setStoredProfile = (profile: Profile) => {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

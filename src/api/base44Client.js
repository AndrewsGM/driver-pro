
// Mock implementation of Base 44 Client for Microservices Transition
// This replaces the actual @base44/sdk with local mocks that will eventually
// point to our new microservices.

const mockUser = {
  id: "user_123",
  email: "demo@driverpro.com",
  full_name: "João Silva",
  created_at: new Date().toISOString()
};

const mockProgress = {
  level: 12,
  total_xp: 8450,
  streak_days: 5,
  total_sessions: 22,
  total_hours: 18.5,
  avg_score: 87,
  skills: {
    parking: 88,
    highway: 78,
    night_driving: 92,
    urban: 85,
    maneuvers: 75
  },
  badges: ['iniciante', 'primeira_aula'],
  subscription_plan: 'quarterly', // changed to quarterly so UI shows premium features
  created_by: "demo@driverpro.com"
};

const mockSessions = [
  {
    id: "sess_1",
    created_date: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    score: 90,
    duration_minutes: 45,
    type: 'urban'
  },
  {
    id: "sess_2",
    created_date: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed',
    score: 85,
    duration_minutes: 30,
    type: 'parking'
  }
];

export const base44 = {
  auth: {
    me: async () => {
      console.log("[Mock Auth] Returning mock user");
      return mockUser;
    }
  },
  entities: {
    UserProgress: {
      filter: async (query) => {
        console.log("[Mock Data] Fetching UserProgress", query);
        return [mockProgress];
      }
    },
    DrivingSession: {
      filter: async (query, sort, limit) => {
        console.log("[Mock Data] Fetching DrivingSession", query);
        return mockSessions;
      }
    },
    Badge: {
      filter: async () => []
    }
  }
};

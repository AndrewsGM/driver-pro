
// Refactored Base 44 Client for Microservices
// Uses real HTTP requests to API Gateway, but falls back to Mock Data if backend is offline.

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:80';

// ==========================================
// MOCK DATA FALLBACKS (Robustness Strategy)
// ==========================================

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
  subscription_plan: 'quarterly',
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
  },
  {
    id: "sess_3",
    created_date: new Date(Date.now() - 259200000).toISOString(),
    status: 'completed',
    score: 95,
    duration_minutes: 60,
    type: 'highway'
  }
];

// ==========================================
// HTTP REQUEST HANDLER
// ==========================================

const request = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_GATEWAY}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Short timeout (1.5s) to fallback quickly in dev environment
      signal: AbortSignal.timeout(1500)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn(`[Client] Backend unreachable (${endpoint}) - Using Mock Fallback.`);
    }
    throw error;
  }
};

// ==========================================
// CLIENT EXPORT
// ==========================================

export const base44 = {
  auth: {
    me: async () => {
      try {
        return await request('/api/auth/me');
      } catch (e) {
        return mockUser;
      }
    }
  },
  entities: {
    UserProgress: {
      filter: async (query) => {
        try {
          const data = await request('/api/auth/progress');
          return [data];
        } catch (e) {
          return [mockProgress];
        }
      }
    },
    DrivingSession: {
      filter: async (query, sort, limit) => {
        try {
          // Mapping filter to Class Service
          return await request('/api/classes/classes');
        } catch (e) {
          return mockSessions;
        }
      }
    },
    Badge: {
      filter: async () => []
    },
    Exam: {
      questions: async () => {
        try {
          return await request('/api/exams/questions');
        } catch (e) {
          // Fallback hardcoded questions if backend fails
          return [
            { id: 1, category: 'Legislação de Trânsito', question: 'Qual a velocidade máxima permitida em vias locais?', options: ['30 km/h', '40 km/h', '50 km/h', '60 km/h'], correct: 0 },
            { id: 2, category: 'Legislação de Trânsito', question: 'A CNH provisória tem validade de:', options: ['6 meses', '1 ano', '2 anos', '5 anos'], correct: 1 },
            { id: 3, category: 'Legislação de Trânsito', question: 'O que é proibido fazer ao dirigir?', options: ['Usar cinto de segurança', 'Usar celular', 'Ligar setas', 'Olhar retrovisor'], correct: 1 },
            { id: 4, category: 'Legislação de Trânsito', question: 'A distância mínima de parada em farol vermelho é:', options: ['Antes da faixa', 'Sobre a faixa', 'Depois da faixa', 'Não há regra'], correct: 0 },
            { id: 5, category: 'Legislação de Trânsito', question: 'Dirigir sob efeito de álcool é:', options: ['Infração leve', 'Infração média', 'Infração grave', 'Crime'], correct: 3 },
            { id: 6, category: 'Legislação de Trânsito', question: 'O uso do farol baixo é obrigatório:', options: ['Apenas à noite', 'Em rodovias e túneis', 'Só em túneis', 'Nunca'], correct: 1 },
            { id: 7, category: 'Legislação de Trânsito', question: 'Ciclistas têm preferência:', options: ['Sempre', 'Nunca', 'Só em ciclovias', 'Só em cruzamentos'], correct: 0 },
            { id: 8, category: 'Legislação de Trânsito', question: 'A ultrapassagem pela direita é:', options: ['Permitida', 'Proibida', 'Permitida em rodovias', 'Depende da via'], correct: 1 },
            { id: 9, category: 'Legislação de Trânsito', question: 'Estacionar a menos de 5m do cruzamento é:', options: ['Permitido', 'Proibido', 'Permitido à noite', 'Permitido de dia'], correct: 1 },
            { id: 10, category: 'Legislação de Trânsito', question: 'O triângulo de sinalização deve ficar a quantos metros?', options: ['20m', '30m', '40m', '50m'], correct: 1 },
            // ... keeping a subset for fallback
            { id: 11, category: 'Direção Defensiva', question: 'Qual a distância segura do veículo da frente?', options: ['1 segundo', '2 segundos', '3 segundos', '5 segundos'], correct: 1 },
          ];
        }
      }
    }
  },
  // New Integrations Namespace for AI
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => {
        try {
          const data = await request('/api/ai/analyze', {
            method: 'POST',
            body: JSON.stringify({ prompt })
          });
          return data.response;
        } catch (e) {
          // Mock AI Response
          return "Olá! Como seu Coach IA (Modo Offline), sugiro focar na suavidade da frenagem. Notei que em curvas você tende a frear bruscamente. Tente antecipar a curva reduzindo a velocidade antes de entrar nela.";
        }
      }
    }
  }
};

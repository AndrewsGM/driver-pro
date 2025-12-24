import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Calendar, Clock, TrendingUp, 
  Car, MapPin, FileText, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function History() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        window.location.href = createPageUrl('Dashboard');
      }
    };
    loadUser();
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['allSessions', filter],
    queryFn: async () => {
      const query = { created_by: user?.email, status: 'completed' };
      if (filter !== 'all') {
        query.session_type = filter;
      }
      return await base44.entities.DrivingSession.filter(query, '-created_date', 50);
    },
    enabled: !!user
  });

  const getSessionIcon = (type) => {
    switch(type) {
      case 'practice': return Car;
      case 'simulation': return MapPin;
      case 'exam': return FileText;
      default: return Car;
    }
  };

  const getSessionLabel = (type) => {
    switch(type) {
      case 'practice': return 'Prática';
      case 'simulation': return 'Simulado';
      case 'exam': return 'Exame';
      default: return 'Sessão';
    }
  };

  const calculateStats = () => {
    if (!sessions || sessions.length === 0) return { total: 0, avgScore: 0, totalHours: 0 };
    
    const total = sessions.length;
    const avgScore = sessions.reduce((acc, s) => acc + (s.final_score || 0), 0) / total;
    const totalHours = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60;
    
    return { total, avgScore: avgScore.toFixed(0), totalHours: totalHours.toFixed(1) };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-5">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Histórico</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-[#1E3A5F]">{stats.total}</p>
            <p className="text-xs text-gray-500">Sessões</p>
          </Card>
          <Card className="p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-[#1E3A5F]">{stats.avgScore}</p>
            <p className="text-xs text-gray-500">Média</p>
          </Card>
          <Card className="p-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-[#1E3A5F]">{stats.totalHours}h</p>
            <p className="text-xs text-gray-500">Total</p>
          </Card>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-4">
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <TabsList className="w-full bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="all" className="flex-1 rounded-lg">Todas</TabsTrigger>
            <TabsTrigger value="practice" className="flex-1 rounded-lg">Prática</TabsTrigger>
            <TabsTrigger value="simulation" className="flex-1 rounded-lg">Simulado</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Sessions List */}
      <div className="px-5 pb-6 space-y-3">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 rounded-2xl animate-pulse">
                <div className="h-16 bg-gray-100 rounded-xl" />
              </Card>
            ))}
          </div>
        ) : sessions?.length === 0 ? (
          <Card className="p-8 rounded-2xl text-center">
            <p className="text-gray-500">Nenhuma sessão encontrada</p>
          </Card>
        ) : (
          sessions?.map((session, index) => {
            const Icon = getSessionIcon(session.session_type);
            const isPassing = session.final_score >= 70;
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 rounded-2xl hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isPassing ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          isPassing ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1E3A5F]">
                          {getSessionLabel(session.session_type)}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(session.created_date), "dd MMM", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration_minutes || 0} min
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isPassing ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {session.final_score}
                      </div>
                      <div className="text-xs text-gray-400">pontos</div>
                    </div>
                  </div>

                  {/* Error summary */}
                  {session.errors?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {session.errors.length} erro{session.errors.length > 1 ? 's' : ''} detectado{session.errors.length > 1 ? 's' : ''}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
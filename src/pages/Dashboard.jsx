import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bell, Settings, ChevronRight, Play, TrendingUp, Award, Brain } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const { data: progress } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const results = await base44.entities.UserProgress.filter({ 
        created_by: user?.email 
      });
      return results[0] || {
        level: 12,
        total_xp: 8450,
        streak_days: 0,
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
        badges: ['iniciante'],
        subscription_plan: 'free'
      };
    },
    enabled: !!user
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recentSessions'],
    queryFn: async () => {
      return await base44.entities.DrivingSession.filter(
        { created_by: user?.email, status: 'completed' },
        '-created_date',
        5
      );
    },
    enabled: !!user
  });

  const getInitials = (name) => {
    if (!name) return 'J';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getPlanLabel = (plan) => {
    switch(plan) {
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'annual': return 'Premium';
      default: return 'Gratuito';
    }
  };

  const skillsData = [
    { key: 'urban', label: 'Cidade', value: progress?.skills?.urban || 85, color: '#3B82F6' },
    { key: 'highway', label: 'Rodovia', value: progress?.skills?.highway || 78, color: '#10B981' },
    { key: 'night_driving', label: 'Noturna', value: progress?.skills?.night_driving || 92, color: '#8B5CF6' },
    { key: 'parking', label: 'Baliza', value: progress?.skills?.parking || 88, color: '#F59E0B' },
    { key: 'maneuvers', label: 'Rampa', value: progress?.skills?.maneuvers || 75, color: '#EF4444' },
  ];

  const badges = [
    { icon: '🏁', color: '#10B981' },
    { icon: '⭐', color: '#3B82F6' },
    { icon: '💯', color: '#EC4899' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 text-xs">Olá,</p>
            <h1 className="text-xl font-bold text-[#1E3A5F]">
              {user?.full_name?.split(' ')[0] || 'João'}
            </h1>
            <p className="text-xs text-gray-400">👑 {getPlanLabel(progress?.subscription_plan)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
            <Link to={createPageUrl('Settings')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5 text-gray-600" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Level Card */}
        <Card className="bg-gradient-to-r from-[#2E5C8A] to-[#1E3A5F] p-4 rounded-3xl text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-white/70 text-xs">Nível</p>
                <p className="text-2xl font-bold">{progress?.level || 12}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">XP Total</p>
              <p className="text-xl font-bold">{progress?.total_xp || 8450}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">{(progress?.total_xp || 8450) % 10000} XP</span>
              <span className="text-white/70">10.000 XP para Nível {(progress?.level || 12) + 1}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${((progress?.total_xp || 8450) % 10000) / 100}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="px-5 py-5 space-y-5">
        {/* Start Lesson Card */}
        <Link to={createPageUrl('Session')}>
          <Card className="bg-gradient-to-r from-green-400 to-green-500 p-5 rounded-3xl text-white flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Iniciar Nova Aula</h3>
                <p className="text-white/80 text-sm">Ative o copiloto IA</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6" />
          </Card>
        </Link>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 rounded-2xl bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <span className="text-xs text-gray-500">Nota Média</span>
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F]">{progress?.avg_score || 87}</p>
          </Card>

          <Card className="p-4 rounded-2xl bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">⏰</span>
              </div>
              <span className="text-xs text-gray-500">Horas de Prática</span>
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F]">{progress?.total_hours?.toFixed(1) || 18.5}<span className="text-lg text-gray-400">h</span></p>
          </Card>

          <Card className="p-4 rounded-2xl bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">📚</span>
              </div>
              <span className="text-xs text-gray-500">Total de Aulas</span>
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F]">{progress?.total_sessions || 22}</p>
          </Card>

          <Card className="p-4 rounded-2xl bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Ranking</span>
            </div>
            <p className="text-3xl font-bold text-[#1E3A5F]">#24</p>
          </Card>
        </div>

        {/* Progress by Category */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1E3A5F]">Progresso por Categoria</h3>
            <button className="text-xs text-blue-600 font-medium">Ver tudo</button>
          </div>
          <Card className="p-4 rounded-3xl bg-white space-y-3">
            {skillsData.map((skill, index) => (
              <div key={skill.key} className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${skill.color}20` }}
                >
                  {index === 0 && <span className="text-lg">🏙️</span>}
                  {index === 1 && <span className="text-lg">🛣️</span>}
                  {index === 2 && <span className="text-lg">🌙</span>}
                  {index === 3 && <span className="text-lg">🅿️</span>}
                  {index === 4 && <span className="text-lg">⛰️</span>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                    <span className="text-xs text-gray-400">{skill.value}/15 aulas</span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(skill.value / 15) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.color }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: skill.color }}>
                  {skill.value}
                </span>
              </div>
            ))}
          </Card>
        </div>

        {/* Premium Features */}
        {(progress?.subscription_plan === 'quarterly' || progress?.subscription_plan === 'annual') && (
          <div className="space-y-3">
            <Link to={createPageUrl('AICoach')}>
              <Card className="p-4 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E3A5F]">Análise com IA</h4>
                      <p className="text-xs text-gray-500">Coach inteligente 24/7</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            </Link>
            
            <Link to={createPageUrl('TheoreticalExam')}>
              <Card className="p-4 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E3A5F]">Exame Teórico</h4>
                      <p className="text-xs text-gray-500">Simulado completo com feedback</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Recent Badges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1E3A5F]">Conquistas Recentes</h3>
            <button className="text-xs text-blue-600 font-medium">Ver todas</button>
          </div>
          <div className="flex gap-3">
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${badge.color}20` }}
              >
                {badge.icon}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upgrade Banner */}
        {progress?.subscription_plan === 'free' && (
          <Link to={createPageUrl('Subscription')}>
            <Card className="p-5 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs bg-yellow-400 text-purple-900 px-2 py-1 rounded-full font-bold">
                  PREMIUM
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1">Evolua Mais Rápido</h3>
              <p className="text-white/80 text-sm mb-3">
                IA avançada, simulador e muito mais
              </p>
              <div className="flex items-center text-sm font-medium">
                <span>Ver planos a partir de R$ 19,99</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
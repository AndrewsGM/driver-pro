import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, Trophy, Medal, Crown, 
  Star, TrendingUp, ChevronRight
} from 'lucide-react';

export default function Ranking() {
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState('weekly');
  const [subscription, setSubscription] = useState('free');

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const progressList = await base44.entities.UserProgress.filter({
          created_by: userData.email
        });
        
        if (progressList.length > 0) {
          setSubscription(progressList[0].subscription_plan || 'free');
        }
      } catch (e) {
        window.location.href = createPageUrl('Dashboard');
      }
    };
    loadData();
  }, []);

  const { data: allProgress } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      return await base44.entities.UserProgress.list('-total_xp', 100);
    },
    enabled: !!user
  });

  // Mock ranking data for demonstration
  const mockRanking = [
    { rank: 1, name: 'João Silva', xp: 15420, level: 25, trend: 'up' },
    { rank: 2, name: 'Maria Santos', xp: 14850, level: 24, trend: 'up' },
    { rank: 3, name: 'Pedro Oliveira', xp: 13200, level: 22, trend: 'down' },
    { rank: 4, name: 'Ana Costa', xp: 12100, level: 20, trend: 'same' },
    { rank: 5, name: 'Lucas Pereira', xp: 11500, level: 19, trend: 'up' },
    { rank: 6, name: 'Julia Lima', xp: 10800, level: 18, trend: 'down' },
    { rank: 7, name: 'Gabriel Souza', xp: 9900, level: 17, trend: 'up' },
    { rank: 8, name: 'Beatriz Alves', xp: 9200, level: 16, trend: 'same' },
    { rank: 9, name: 'Rafael Martins', xp: 8500, level: 15, trend: 'up' },
    { rank: 10, name: 'Camila Rocha', xp: 7800, level: 14, trend: 'down' },
  ];

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch(rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default: return 'bg-white border-gray-100';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (subscription === 'free' || subscription === 'monthly') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-6 pt-12 pb-6 flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Ranking</h1>
        </div>

        <div className="px-6 py-8">
          <Card className="p-8 rounded-3xl text-center">
            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <Trophy className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
              Recurso Premium
            </h2>
            <p className="text-gray-500 mb-6">
              O ranking está disponível a partir do plano Trimestral. Compita com outros alunos e suba de posição!
            </p>
            <Link to={createPageUrl('Subscription')}>
              <Button className="w-full h-14 bg-amber-500 hover:bg-amber-600 rounded-xl text-lg font-semibold">
                Ver Planos
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2d4a6f] px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">Ranking</h1>
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 py-6">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Avatar className="h-16 w-16 mx-auto mb-2 border-4 border-gray-300">
              <AvatarFallback className="bg-gray-300 text-gray-700 text-lg font-bold">
                {getInitials(mockRanking[1].name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-medium text-sm">{mockRanking[1].name.split(' ')[0]}</p>
            <div className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-bold mt-1">
              2º
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center -mt-6"
          >
            <div className="relative">
              <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-1" />
              <Avatar className="h-20 w-20 mx-auto mb-2 border-4 border-yellow-400">
                <AvatarFallback className="bg-yellow-400 text-yellow-900 text-xl font-bold">
                  {getInitials(mockRanking[0].name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-white font-medium">{mockRanking[0].name.split(' ')[0]}</p>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mt-1">
              1º
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Avatar className="h-16 w-16 mx-auto mb-2 border-4 border-amber-600">
              <AvatarFallback className="bg-amber-600 text-white text-lg font-bold">
                {getInitials(mockRanking[2].name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-medium text-sm">{mockRanking[2].name.split(' ')[0]}</p>
            <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold mt-1">
              3º
            </div>
          </motion.div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="px-6 py-4 -mt-4">
        <Card className="p-1 rounded-2xl">
          <Tabs defaultValue="weekly" onValueChange={setPeriod}>
            <TabsList className="w-full bg-gray-100 rounded-xl">
              <TabsTrigger value="weekly" className="flex-1 rounded-lg">Semanal</TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1 rounded-lg">Mensal</TabsTrigger>
              <TabsTrigger value="all" className="flex-1 rounded-lg">Geral</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
      </div>

      {/* Ranking List */}
      <div className="px-6 pb-6 space-y-3">
        {mockRanking.slice(3).map((player, index) => (
          <motion.div
            key={player.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`p-4 rounded-2xl border ${getRankBg(player.rank)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(player.rank)}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#1E3A5F] text-white font-semibold">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-[#1E3A5F]">{player.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="h-3 w-3 text-amber-500" />
                      <span>Nível {player.level}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1E3A5F]">{player.xp.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">XP</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Your Position */}
        <Card className="p-4 rounded-2xl bg-[#1E3A5F] text-white mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-lg font-bold text-white/60">#45</span>
              </div>
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarFallback className="bg-white text-[#1E3A5F] font-semibold">
                  {getInitials(user?.full_name || 'Você')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Você</h3>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span>+5 posições</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">2,450</p>
              <p className="text-xs text-white/60">XP</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
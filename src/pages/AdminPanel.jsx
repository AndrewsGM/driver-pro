import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Search, Crown, Shield, Check,
  Users, TrendingUp, DollarSign
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPlan, setNewPlan] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        setUser(userData);
      } catch (e) {
        window.location.href = createPageUrl('Dashboard');
      }
    };
    loadUser();
  }, []);

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      return await base44.entities.User.list('-created_date', 100);
    },
    enabled: !!user && user.role === 'admin'
  });

  const { data: allProgress } = useQuery({
    queryKey: ['allProgress'],
    queryFn: async () => {
      return await base44.entities.UserProgress.list('-total_xp', 100);
    },
    enabled: !!user && user.role === 'admin'
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan }) => {
      const progressList = await base44.entities.UserProgress.filter({
        user_id: userId
      });
      
      const expirationDate = new Date();
      switch(plan) {
        case 'monthly':
          expirationDate.setMonth(expirationDate.getMonth() + 1);
          break;
        case 'quarterly':
          expirationDate.setMonth(expirationDate.getMonth() + 3);
          break;
        case 'annual':
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
          break;
      }
      
      if (progressList.length > 0) {
        return await base44.entities.UserProgress.update(progressList[0].id, {
          subscription_plan: plan,
          subscription_expires: expirationDate.toISOString().split('T')[0]
        });
      } else {
        return await base44.entities.UserProgress.create({
          user_id: userId,
          subscription_plan: plan,
          subscription_expires: expirationDate.toISOString().split('T')[0]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProgress'] });
      setSelectedUser(null);
      setNewPlan('');
    }
  });

  const getUserProgress = (userId) => {
    return allProgress?.find(p => p.user_id === userId);
  };

  const getPlanLabel = (plan) => {
    switch(plan) {
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'annual': return 'Anual';
      default: return 'Gratuito';
    }
  };

  const getPlanColor = (plan) => {
    switch(plan) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annual': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = allUsers?.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    totalUsers: allUsers?.length || 0,
    premiumUsers: allProgress?.filter(p => p.subscription_plan !== 'free').length || 0,
    revenue: allProgress?.reduce((acc, p) => {
      switch(p.subscription_plan) {
        case 'monthly': return acc + 19.99;
        case 'quarterly': return acc + 49.99;
        case 'annual': return acc + 149.99;
        default: return acc;
      }
    }, 0) || 0
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2d4a6f] px-5 pt-10 pb-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Painel Admin</h1>
            <p className="text-white/70 text-sm">Gerenciar usuários e planos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-white/70">Usuários</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <Crown className="h-5 w-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.premiumUsers}</p>
            <p className="text-xs text-white/70">Premium</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1" />
            <p className="text-2xl font-bold">R$ {stats.revenue.toFixed(0)}</p>
            <p className="text-xs text-white/70">Receita</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="pl-12 h-12 rounded-xl border-gray-200 bg-white"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="px-5 pb-6 space-y-3">
        {filteredUsers.map((u, index) => {
          const progress = getUserProgress(u.id);
          const plan = progress?.subscription_plan || 'free';
          
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="p-4 rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedUser(u);
                  setNewPlan(plan);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1E3A5F] text-white rounded-full flex items-center justify-center font-bold">
                      {u.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1E3A5F]">{u.full_name}</h3>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPlanColor(plan)}`}>
                      {getPlanLabel(plan)}
                    </span>
                    {u.role === 'admin' && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Plano</DialogTitle>
            <DialogDescription>
              Alterar plano de {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Plano de Assinatura
              </label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">🆓 Gratuito</SelectItem>
                  <SelectItem value="monthly">💙 Mensal - R$ 19,99</SelectItem>
                  <SelectItem value="quarterly">💜 Trimestral - R$ 49,99</SelectItem>
                  <SelectItem value="annual">👑 Anual - R$ 149,99</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Esta alteração será aplicada imediatamente, sem necessidade de pagamento.
                A data de expiração será calculada automaticamente.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setSelectedUser(null)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-[#1E3A5F] hover:bg-[#2d4a6f]"
                onClick={() => {
                  if (selectedUser && newPlan) {
                    updatePlanMutation.mutate({ userId: selectedUser.id, plan: newPlan });
                  }
                }}
                disabled={!newPlan || updatePlanMutation.isPending}
              >
                {updatePlanMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Confirmar
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
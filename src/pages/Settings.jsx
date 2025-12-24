import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CameraModal from '@/components/camera/CameraModal';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, User, Bell, Shield, Camera,
  ChevronRight, LogOut, Crown, Moon, Volume2,
  Vibrate, MapPin, Settings as SettingsIcon
} from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    vibration: true,
    darkMode: false,
    locationTracking: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const progressList = await base44.entities.UserProgress.filter({
          created_by: userData.email
        });
        
        if (progressList.length > 0) {
          setProgress(progressList[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleFacialRegistration = () => {
    setShowCamera(true);
  };

  const handleFacialCapture = async (imageData) => {
    // In production, save facial data to backend
    try {
      if (progress) {
        await base44.entities.UserProgress.update(progress.id, {
          facial_data_registered: true
        });
        setProgress(prev => ({ ...prev, facial_data_registered: true }));
      }
    } catch (error) {
      console.error('Error saving facial data:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
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

  const settingsGroups = [
    {
      title: 'Alertas',
      items: [
        { key: 'soundAlerts', label: 'Alertas Sonoros', icon: Volume2 },
        { key: 'vibration', label: 'Vibração', icon: Vibrate },
        { key: 'notifications', label: 'Notificações', icon: Bell },
      ]
    },
    {
      title: 'Privacidade',
      items: [
        { key: 'locationTracking', label: 'Rastreamento GPS', icon: MapPin },
      ]
    },
    {
      title: 'Aparência',
      items: [
        { key: 'darkMode', label: 'Modo Escuro', icon: Moon },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-5">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Perfil</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5 space-y-5">
        {/* Admin Panel Link */}
        {user?.role === 'admin' && (
          <Link to={createPageUrl('AdminPanel')}>
            <Card className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <SettingsIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Painel Admin</h3>
                    <p className="text-white/80 text-sm">Gerenciar usuários e planos</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6" />
              </div>
            </Card>
          </Link>
        )}
        
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-5 rounded-3xl bg-gradient-to-r from-[#2E5C8A] to-[#1E3A5F] text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-white">
                  <AvatarFallback className="bg-white text-[#1E3A5F] text-lg font-bold">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold">
                    {user?.full_name || 'João Silva'}
                  </h2>
                  <p className="text-white/70 text-xs">{user?.email}</p>
                </div>
              </div>
              <Camera className="h-5 w-5 text-white/50" />
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  progress?.subscription_plan === 'free' 
                    ? 'bg-white/20' 
                    : 'bg-yellow-400 text-[#1E3A5F]'
                }`}>
                  {getPlanLabel(progress?.subscription_plan)}
                </span>
                {user?.role === 'admin' && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
              <Link to={createPageUrl('Subscription')}>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 h-8 text-xs"
                >
                  Fazer Upgrade
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 rounded-2xl bg-white">
              <p className="text-xs text-gray-500 mb-1">📞 Telefone</p>
              <p className="text-sm font-medium text-[#1E3A5F]">(11) 99999-9999</p>
            </Card>
            <Card className="p-3 rounded-2xl bg-white">
              <p className="text-xs text-gray-500 mb-1">🎂 Data de Nascimento</p>
              <p className="text-sm font-medium text-[#1E3A5F]">14/05/1995</p>
            </Card>
          </div>
        </motion.div>

        {/* Facial Recognition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-4 rounded-2xl bg-white" onClick={handleFacialRegistration}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-medium text-[#1E3A5F]">Validação Facial</h3>
                  <p className="text-xs text-gray-400">
                    {progress?.facial_data_registered ? 'Ativo' : 'Não cadastrado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  progress?.facial_data_registered 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {progress?.facial_data_registered ? 'Ativo' : 'Inativo'}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-3xl overflow-hidden bg-white">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-800">Notificações</span>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, notifications: checked }))
                }
              />
            </div>
            
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-800">Modo Escuro</span>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>
            
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-800">Dados Pessoais</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-800">Segurança</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair da Conta
          </Button>
        </motion.div>

        {/* Version */}
        <p className="text-center text-gray-400 text-xs py-4">
          Driver Intelligence v1.0.0 • Powered by VSOFT
        </p>
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleFacialCapture}
        mode="front"
        purpose="facial"
      />
    </div>
  );
}
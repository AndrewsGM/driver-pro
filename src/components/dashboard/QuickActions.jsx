import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Play, MapPin, BookOpen, Trophy, Camera } from 'lucide-react';

const actions = [
  { 
    id: 'session', 
    label: 'Iniciar Aula', 
    icon: Play, 
    color: '#10B981',
    gradient: 'from-emerald-400 to-emerald-600',
    description: 'Comece uma nova sessão de prática'
  },
  { 
    id: 'simulation', 
    label: 'Simulado', 
    icon: MapPin, 
    color: '#3B82F6',
    gradient: 'from-blue-400 to-blue-600',
    description: 'Simule a prova de direção'
  },
  { 
    id: 'theory', 
    label: 'Teoria', 
    icon: BookOpen, 
    color: '#8B5CF6',
    gradient: 'from-violet-400 to-violet-600',
    description: 'Estude as leis de trânsito'
  },
  { 
    id: 'ranking', 
    label: 'Ranking', 
    icon: Trophy, 
    color: '#F59E0B',
    gradient: 'from-amber-400 to-amber-600',
    description: 'Veja sua posição'
  },
];

export default function QuickActions({ onAction, subscription = 'free' }) {
  const isLocked = (actionId) => {
    if (subscription === 'annual') return false;
    if (subscription === 'quarterly') return actionId === 'simulation';
    if (subscription === 'monthly') return ['simulation', 'ranking'].includes(actionId);
    return ['simulation', 'ranking'].includes(actionId);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        const locked = isLocked(action.id);
        
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative p-5 rounded-2xl cursor-pointer transition-all overflow-hidden ${
                locked ? 'opacity-60' : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
              onClick={() => !locked && onAction(action.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-10`} />
              
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${action.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: action.color }} />
              </div>
              
              <h4 className="font-semibold text-[#1E3A5F]">{action.label}</h4>
              <p className="text-gray-500 text-xs mt-1">{action.description}</p>
              
              {locked && (
                <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                  PRO
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
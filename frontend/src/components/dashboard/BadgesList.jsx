import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { 
  Feather, Crown, Shield, Zap, 
  Award, Star, Target, Medal 
} from 'lucide-react';

const badgeIcons = {
  'pe-de-pluma': Feather,
  'rei-baliza': Crown,
  'motorista-seguro': Shield,
  'velocista': Zap,
  'iniciante': Award,
  'expert': Star,
  'precisao': Target,
  'default': Medal
};

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

const defaultBadges = [
  { code: 'pe-de-pluma', name: 'Pé de Pluma', description: '5 aulas sem frenagens bruscas', rarity: 'rare', earned: false },
  { code: 'rei-baliza', name: 'Rei da Baliza', description: 'Baliza em menos de 2 min 3x', rarity: 'epic', earned: false },
  { code: 'motorista-seguro', name: 'Motorista Seguro', description: '10 sessões nota 90+', rarity: 'legendary', earned: false },
  { code: 'iniciante', name: 'Primeira Volta', description: 'Complete sua primeira aula', rarity: 'common', earned: true },
];

export default function BadgesList({ userBadges = [], allBadges = defaultBadges }) {
  const displayBadges = allBadges.length > 0 ? allBadges : defaultBadges;
  
  return (
    <Card className="p-6 rounded-3xl bg-white border-0 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1E3A5F]">Conquistas</h3>
        <span className="text-sm text-gray-500">
          {userBadges.length}/{displayBadges.length}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {displayBadges.map((badge, index) => {
          const Icon = badgeIcons[badge.code] || badgeIcons.default;
          const isEarned = userBadges.includes(badge.code) || badge.earned;
          
          return (
            <motion.div
              key={badge.code}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center"
            >
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${
                  isEarned 
                    ? `bg-gradient-to-br ${rarityColors[badge.rarity]}` 
                    : 'bg-gray-100'
                }`}
              >
                <Icon className={`h-6 w-6 ${isEarned ? 'text-white' : 'text-gray-300'}`} />
              </div>
              <span className={`text-xs text-center ${isEarned ? 'text-gray-700' : 'text-gray-400'}`}>
                {badge.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, Trophy } from 'lucide-react';

export default function ProgressCard({ progress }) {
  const xpForNextLevel = progress?.level ? progress.level * 500 : 500;
  const currentLevelXP = progress?.total_xp ? progress.total_xp % xpForNextLevel : 0;
  const xpPercentage = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <Card className="bg-gradient-to-br from-[#1E3A5F] to-[#2d4a6f] p-6 rounded-3xl text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/70 text-sm">Seu Nível</p>
          <div className="flex items-center gap-2 mt-1">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            <span className="text-3xl font-bold">{progress?.level || 1}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="font-semibold">{progress?.streak_days || 0} dias</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Progresso do Nível</span>
          <span className="font-medium">{currentLevelXP} / {xpForNextLevel} XP</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{progress?.total_sessions || 0}</p>
          <p className="text-white/60 text-xs">Sessões</p>
        </div>
        <div className="text-center border-x border-white/20">
          <p className="text-2xl font-bold">{progress?.total_hours?.toFixed(1) || 0}h</p>
          <p className="text-white/60 text-xs">Prática</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{progress?.avg_score?.toFixed(0) || 0}</p>
          <p className="text-white/60 text-xs">Média</p>
        </div>
      </div>
    </Card>
  );
}
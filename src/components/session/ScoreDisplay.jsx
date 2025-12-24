import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, XCircle, AlertTriangle, 
  Star, Trophy, Share2, Home 
} from 'lucide-react';

export default function ScoreDisplay({ 
  session, 
  onShare, 
  onHome,
  onRetry 
}) {
  const score = session?.final_score || 0;
  const errors = session?.errors || [];
  const xpEarned = session?.xp_earned || 0;
  
  const lightErrors = errors.filter(e => e.severity === 'light').length;
  const seriousErrors = errors.filter(e => e.severity === 'serious').length;
  
  const getScoreColor = () => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreMessage = () => {
    if (score >= 90) return 'Excelente! Você está pronto!';
    if (score >= 80) return 'Muito bom! Continue assim!';
    if (score >= 70) return 'Bom! Mas pode melhorar.';
    if (score >= 60) return 'Precisa praticar mais.';
    return 'Continue praticando!';
  };

  const isPassing = score >= 70;

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="p-8 rounded-3xl bg-white text-center overflow-hidden relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative z-10"
        >
          <div 
            className="w-40 h-40 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ 
              background: `conic-gradient(${getScoreColor()} ${score}%, #E5E7EB ${score}%)` 
            }}
          >
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
              <div>
                <span 
                  className="text-5xl font-bold"
                  style={{ color: getScoreColor() }}
                >
                  {score}
                </span>
                <span className="text-xl text-gray-400">/100</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            {isPassing ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <span className={`text-xl font-semibold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
              {isPassing ? 'Aprovado' : 'Reprovado'}
            </span>
          </div>

          <p className="text-gray-500">{getScoreMessage()}</p>
        </motion.div>

        {/* Background decoration */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            background: `radial-gradient(circle at center, ${getScoreColor()}, transparent 70%)` 
          }}
        />
      </Card>

      {/* XP Earned */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Star className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">XP Conquistado</p>
                <p className="text-3xl font-bold">+{xpEarned}</p>
              </div>
            </div>
            <Trophy className="h-12 w-12 text-white/30" />
          </div>
        </Card>
      </motion.div>

      {/* Error Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 rounded-3xl bg-white">
          <h4 className="font-semibold text-[#1E3A5F] mb-4">Resumo de Erros</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">Leves</span>
              </div>
              <p className="text-2xl font-bold text-amber-800">{lightErrors}</p>
              <p className="text-xs text-amber-600">-1 ponto cada</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">Graves</span>
              </div>
              <p className="text-2xl font-bold text-red-800">{seriousErrors}</p>
              <p className="text-xs text-red-600">-5 pontos cada</p>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Detalhes:</p>
              {errors.slice(0, 5).map((error, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-xl text-sm ${
                    error.severity === 'serious' 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {error.description}
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-14 rounded-xl border-2 border-[#1E3A5F] text-[#1E3A5F]"
          onClick={onShare}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Compartilhar
        </Button>
        <Button
          className="h-14 rounded-xl bg-[#1E3A5F] hover:bg-[#2d4a6f]"
          onClick={onHome}
        >
          <Home className="h-5 w-5 mr-2" />
          Início
        </Button>
      </div>
    </div>
  );
}
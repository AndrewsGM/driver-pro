import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Rocket, Zap } from 'lucide-react';

const plans = {
  free: {
    name: 'Gratuito',
    price: 0,
    period: '',
    icon: Sparkles,
    color: '#6B7280',
    features: [
      '3 aulas com telemetria/mês',
      'Dashboard básico',
      'Monitoramento G-Force',
      'XP e badges básicos',
      '1 rota no simulador AR',
      'Histórico de 7 dias'
    ]
  },
  monthly: {
    name: 'Mensal',
    price: 19.99,
    period: '/mês',
    icon: Crown,
    color: '#3B82F6',
    popular: false,
    features: [
      '✨ Aulas ilimitadas',
      '👁️ Análise de atenção via câmera',
      '📊 Relatórios detalhados',
      '🎯 Dicas personalizadas IA',
      '💬 5 sessões Coach IA/mês',
      '🏆 Ranking e comparações',
      '🗺️ Todas rotas no simulador'
    ]
  },
  quarterly: {
    name: 'Trimestral',
    price: 49.99,
    period: '/3 meses',
    icon: Zap,
    color: '#8B5CF6',
    popular: true,
    savings: 'Economize R$ 9,98',
    features: [
      '⭐ Tudo do Mensal +',
      '🎥 Gravação de aulas',
      '🤖 Análise de vídeo por IA',
      '⚠️ Alertas preditivos de erro',
      '🔮 Análise preditiva de aprovação',
      '💬 30 sessões Coach IA/mês',
      '📉 Análise de estresse',
      '⏰ Horários ideais de prática',
      '🎯 Detecção de pontos cegos',
      '📝 Simulado exame teórico completo'
    ]
  },
  annual: {
    name: 'Anual',
    price: 149.99,
    period: '/ano',
    icon: Rocket,
    color: '#F59E0B',
    popular: false,
    savings: 'Economize R$ 89,89',
    features: [
      '🤖 Coach IA 24/7 ILIMITADO',
      '📝 Simulado exame teórico completo',
      '🎯 Percurso real do DETRAN',
      '📊 Dados reais de aprovação',
      '⚡ Prioridade agendamento exame',
      '🚗 Desconto em seguros até 15%',
      '📹 Download de vídeos',
      '📋 Relatório para instrutor',
      '🎖️ Badges exclusivos',
      '⭐ Suporte prioritário'
    ]
  }
};

export default function PlanCard({ planKey, currentPlan, onSelect }) {
  const plan = plans[planKey];
  const Icon = plan.icon;
  const isCurrentPlan = currentPlan === planKey;
  const isUpgrade = planKey !== 'free' && currentPlan !== planKey;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-5 rounded-3xl relative overflow-hidden ${
        plan.popular ? 'border-2 border-violet-400' : ''
      }`}>
        {plan.popular && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-semibold px-4 py-1 rounded-bl-xl">
            MAIS POPULAR
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${plan.color}20` }}
          >
            <Icon className="h-6 w-6" style={{ color: plan.color }} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#1E3A5F]">{plan.name}</h3>
            {plan.savings && (
              <span className="text-xs text-green-600 font-medium">{plan.savings}</span>
            )}
          </div>
        </div>

        <div className="mb-5">
          <span className="text-3xl font-bold text-[#1E3A5F]">
            {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
          </span>
          <span className="text-gray-500 text-sm">{plan.period}</span>
        </div>

        <div className="space-y-2.5 mb-5">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          className={`w-full h-12 rounded-xl font-semibold ${
            isCurrentPlan 
              ? 'bg-gray-200 text-gray-600 cursor-default' 
              : `text-white`
          }`}
          style={!isCurrentPlan ? { backgroundColor: plan.color } : {}}
          onClick={() => !isCurrentPlan && onSelect?.(planKey)}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Plano Atual' : isUpgrade ? 'Assinar' : 'Selecionar'}
        </Button>
      </Card>
    </motion.div>
  );
}
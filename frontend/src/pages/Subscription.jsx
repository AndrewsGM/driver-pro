import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PlanCard from '@/components/subscription/PlanCard';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Subscription() {
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const progressList = await base44.entities.UserProgress.filter({
          created_by: userData.email
        });
        
        if (progressList.length > 0) {
          setCurrentPlan(progressList[0].subscription_plan || 'free');
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const handleSelectPlan = async (planKey) => {
    if (planKey === 'free' || planKey === currentPlan) return;
    
    setSelectedPlan(planKey);
    
    // In production, this would open a payment gateway
    // For demo, we simulate successful subscription
    setTimeout(async () => {
      try {
        const progressList = await base44.entities.UserProgress.filter({
          created_by: user?.email
        });
        
        if (progressList.length > 0) {
          await base44.entities.UserProgress.update(progressList[0].id, {
            subscription_plan: planKey,
            subscription_expires: getExpirationDate(planKey)
          });
        } else {
          await base44.entities.UserProgress.create({
            user_id: user?.id,
            subscription_plan: planKey,
            subscription_expires: getExpirationDate(planKey)
          });
        }
        
        setCurrentPlan(planKey);
        setShowSuccess(true);
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
    }, 1500);
  };

  const getExpirationDate = (planKey) => {
    const date = new Date();
    switch(planKey) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'annual':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2d4a6f] px-5 pt-10 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">Planos</h1>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Evolua Sua Direção
          </h2>
          <p className="text-white/70 text-sm">
            Escolha o plano ideal para você
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="px-5 -mt-8 space-y-4 pb-8">
        {['free', 'monthly', 'quarterly', 'annual'].map((planKey, index) => (
          <motion.div
            key={planKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PlanCard
              planKey={planKey}
              currentPlan={currentPlan}
              onSelect={handleSelectPlan}
            />
          </motion.div>
        ))}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-[#1E3A5F]">
                Assinatura Ativada!
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-gray-600 mb-6">
            Parabéns! Agora você tem acesso a todos os recursos do plano selecionado.
          </p>
          <Button
            onClick={() => {
              setShowSuccess(false);
              window.location.href = createPageUrl('Dashboard');
            }}
            className="w-full h-12 bg-[#1E3A5F] hover:bg-[#2d4a6f] rounded-xl"
          >
            Começar a Usar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
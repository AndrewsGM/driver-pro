import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CameraModal from '@/components/camera/CameraModal';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, Play, MapPin, Navigation, 
  Volume2, AlertTriangle, CheckCircle2,
  Clock, ChevronRight, Loader2
} from 'lucide-react';

const examRoutes = [
  { id: 1, name: 'Percurso Centro', city: 'São Paulo', difficulty: 'Médio', duration: 25 },
  { id: 2, name: 'Percurso Zona Norte', city: 'São Paulo', difficulty: 'Fácil', duration: 20 },
  { id: 3, name: 'Percurso Zona Sul', city: 'São Paulo', difficulty: 'Difícil', duration: 30 },
];

const checkpoints = [
  { id: 1, type: 'stop', instruction: 'Pare no sinal', distance: 50 },
  { id: 2, type: 'turn_right', instruction: 'Vire à direita', distance: 100 },
  { id: 3, type: 'parking', instruction: 'Inicie a baliza aqui', distance: 200 },
  { id: 4, type: 'turn_left', instruction: 'Vire à esquerda', distance: 300 },
  { id: 5, type: 'stop', instruction: 'Pare na faixa', distance: 400 },
];

export default function Simulation() {
  const [stage, setStage] = useState('select'); // select, loading, active, finished
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [simulationData, setSimulationData] = useState({
    errors: [],
    score: 100,
    startTime: null
  });
  const [showCamera, setShowCamera] = useState(false);
  const [user, setUser] = useState(null);
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

  const startSimulation = (route) => {
    if (subscription === 'free' || subscription === 'monthly') {
      // Redirect to subscription
      window.location.href = createPageUrl('Subscription');
      return;
    }
    
    setSelectedRoute(route);
    setStage('loading');
    
    setTimeout(() => {
      setSimulationData({
        errors: [],
        score: 100,
        startTime: Date.now()
      });
      setCurrentCheckpoint(0);
      setStage('active');
      speakInstruction(checkpoints[0].instruction);
    }, 2000);
  };

  const speakInstruction = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleCheckpointPass = (success) => {
    if (!success) {
      setSimulationData(prev => ({
        ...prev,
        errors: [...prev.errors, {
          checkpoint: currentCheckpoint,
          type: 'missed',
          severity: 'serious'
        }],
        score: Math.max(0, prev.score - 5)
      }));
    }

    if (currentCheckpoint < checkpoints.length - 1) {
      const nextCheckpoint = currentCheckpoint + 1;
      setCurrentCheckpoint(nextCheckpoint);
      speakInstruction(checkpoints[nextCheckpoint].instruction);
    } else {
      finishSimulation();
    }
  };

  const finishSimulation = async () => {
    const finalScore = simulationData.score;
    const duration = Math.floor((Date.now() - simulationData.startTime) / 60000);
    
    try {
      await base44.entities.DrivingSession.create({
        user_id: user?.id,
        session_type: 'simulation',
        start_time: new Date(simulationData.startTime).toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: duration,
        final_score: finalScore,
        errors: simulationData.errors,
        xp_earned: Math.floor(finalScore * 0.8),
        status: 'completed'
      });
    } catch (error) {
      console.error('Error saving simulation:', error);
    }
    
    setStage('finished');
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
          <h1 className="text-xl font-bold text-[#1E3A5F]">Simulado de Prova</h1>
        </div>

        <div className="px-6 py-8">
          <Card className="p-8 rounded-3xl text-center">
            <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center mb-6">
              <MapPin className="h-10 w-10 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
              Recurso Premium
            </h2>
            <p className="text-gray-500 mb-6">
              O simulado de prova está disponível a partir do plano Trimestral. Faça upgrade para simular o exame de direção real!
            </p>
            <Link to={createPageUrl('Subscription')}>
              <Button className="w-full h-14 bg-violet-600 hover:bg-violet-700 rounded-xl text-lg font-semibold">
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
      <div className="bg-white px-6 pt-12 pb-6 flex items-center gap-4">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-[#1E3A5F]">Simulado de Prova</h1>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {stage === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                Escolha o Percurso
              </h2>
              <p className="text-gray-500">
                Simule os percursos reais do exame de direção
              </p>
            </div>

            <div className="space-y-4">
              {examRoutes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => startSimulation(route)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <Navigation className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1E3A5F]">{route.name}</h3>
                          <p className="text-gray-500 text-sm">{route.city}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              route.difficulty === 'Fácil' ? 'bg-green-100 text-green-700' :
                              route.difficulty === 'Médio' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {route.difficulty}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {route.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Modo HUD</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Posicione o celular no painel para projetar as instruções no para-brisa
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-16 w-16 text-[#1E3A5F] animate-spin mb-6" />
            <p className="text-lg text-gray-600">Carregando percurso...</p>
            <p className="text-sm text-gray-400 mt-2">{selectedRoute?.name}</p>
          </div>
        )}

        {stage === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* HUD Style Instruction */}
            <Card className="p-8 rounded-3xl bg-[#1E3A5F] text-white text-center">
              <motion.div
                key={currentCheckpoint}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white/60 text-sm mb-2">Próxima Instrução</p>
                <h2 className="text-3xl font-bold mb-4">
                  {checkpoints[currentCheckpoint]?.instruction}
                </h2>
                <p className="text-white/60">
                  em {checkpoints[currentCheckpoint]?.distance}m
                </p>
              </motion.div>
            </Card>

            {/* Progress */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-500">Progresso</span>
              <span className="text-sm font-medium text-[#1E3A5F]">
                {currentCheckpoint + 1}/{checkpoints.length}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#1E3A5F] rounded-full"
                animate={{ width: `${((currentCheckpoint + 1) / checkpoints.length) * 100}%` }}
              />
            </div>

            {/* Score */}
            <Card className="p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pontuação Atual</span>
                <span className="text-3xl font-bold text-[#1E3A5F]">
                  {simulationData.score}
                </span>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleCheckpointPass(true)}
                className="h-16 bg-green-500 hover:bg-green-600 rounded-xl text-lg font-semibold"
              >
                <CheckCircle2 className="h-6 w-6 mr-2" />
                Concluído
              </Button>
              <Button
                onClick={() => handleCheckpointPass(false)}
                variant="outline"
                className="h-16 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-xl text-lg font-semibold"
              >
                <AlertTriangle className="h-6 w-6 mr-2" />
                Erro
              </Button>
            </div>

            {/* Audio Control */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => speakInstruction(checkpoints[currentCheckpoint]?.instruction)}
            >
              <Volume2 className="h-5 w-5 mr-2" />
              Repetir Instrução
            </Button>
          </motion.div>
        )}

        {stage === 'finished' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-8 rounded-3xl text-center">
              <div 
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{ 
                  background: `conic-gradient(${simulationData.score >= 70 ? '#10B981' : '#EF4444'} ${simulationData.score}%, #E5E7EB ${simulationData.score}%)` 
                }}
              >
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#1E3A5F]">
                    {simulationData.score}
                  </span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                {simulationData.score >= 70 ? 'Aprovado!' : 'Reprovado'}
              </h2>
              <p className="text-gray-500">
                {simulationData.score >= 70 
                  ? 'Você está pronto para o exame real!' 
                  : 'Continue praticando para melhorar'}
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-14 rounded-xl"
                onClick={() => {
                  setStage('select');
                  setSelectedRoute(null);
                }}
              >
                Novo Simulado
              </Button>
              <Link to={createPageUrl('Dashboard')} className="block">
                <Button className="w-full h-14 bg-[#1E3A5F] hover:bg-[#2d4a6f] rounded-xl">
                  Voltar
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={() => {}}
        mode="back"
        purpose="sign"
      />
    </div>
  );
}
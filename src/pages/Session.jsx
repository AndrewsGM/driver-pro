import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import TelemetryMonitor from '@/components/session/TelemetryMonitor';
import ScoreDisplay from '@/components/session/ScoreDisplay';
import CameraModal from '@/components/camera/CameraModal';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, Play, MapPin, AlertTriangle,
  CheckCircle2, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Session() {
  const [sessionState, setSessionState] = useState('idle'); // idle, starting, active, finished
  const [currentSession, setCurrentSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cameraConfig, setCameraConfig] = useState({ open: false, mode: 'front', purpose: 'facial' });
  const [telemetryData, setTelemetryData] = useState({
    harshBrakes: 0,
    harshAccelerations: 0,
    sharpTurns: 0,
    distractionEvents: 0
  });
  const [errors, setErrors] = useState([]);
  const [user, setUser] = useState(null);
  const [routeData, setRouteData] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        window.location.href = createPageUrl('Login');
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    let timer;
    if (sessionState === 'active') {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState]);

  const startSession = async () => {
    setSessionState('starting');
    
    try {
      const session = await base44.entities.DrivingSession.create({
        user_id: user?.id,
        session_type: 'practice',
        start_time: new Date().toISOString(),
        status: 'in_progress',
        telemetry_data: {},
        vision_data: {},
        errors: [],
        route_data: []
      });
      
      setCurrentSession(session);
      setSessionState('active');
      setElapsedTime(0);
    } catch (error) {
      console.error('Error starting session:', error);
      setSessionState('idle');
    }
  };

  const handlePause = () => {
    // Pause logic
  };

  const handleResume = () => {
    // Resume logic
  };

  const calculateScore = useCallback(() => {
    const lightErrors = errors.filter(e => e.severity === 'light').length;
    const seriousErrors = errors.filter(e => e.severity === 'serious').length;
    return Math.max(0, 100 - (lightErrors * 1) - (seriousErrors * 5));
  }, [errors]);

  const calculateXP = (score, duration) => {
    let xp = Math.floor(duration / 60) * 10; // Base XP for time
    xp += Math.floor(score * 0.5); // Bonus for score
    if (score >= 90) xp += 50; // Excellence bonus
    return xp;
  };

  const handleRouteUpdate = (newRouteData) => {
    setRouteData(newRouteData);
  };

  const handleSpeedUpdate = (speed) => {
    setCurrentSpeed(speed);
  };

  const handleDistanceUpdate = (distance) => {
    setTotalDistance(distance);
  };

  const handleStop = async () => {
    if (!currentSession) return;

    const score = calculateScore();
    const xpEarned = calculateXP(score, elapsedTime);

    const updatedSession = {
      end_time: new Date().toISOString(),
      duration_minutes: Math.floor(elapsedTime / 60),
      route_data: routeData,
      telemetry_data: {
        harsh_brakes: telemetryData.harshBrakes,
        harsh_accelerations: telemetryData.harshAccelerations,
        sharp_turns: telemetryData.sharpTurns
      },
      vision_data: {
        distraction_events: telemetryData.distractionEvents
      },
      errors: errors,
      final_score: score,
      xp_earned: xpEarned,
      status: 'completed'
    };

    try {
      await base44.entities.DrivingSession.update(currentSession.id, updatedSession);
      setCurrentSession({ ...currentSession, ...updatedSession });
      setSessionState('finished');

      // Update user progress
      const progressList = await base44.entities.UserProgress.filter({ 
        created_by: user?.email 
      });
      
      if (progressList.length > 0) {
        const progress = progressList[0];
        await base44.entities.UserProgress.update(progress.id, {
          total_xp: (progress.total_xp || 0) + xpEarned,
          total_sessions: (progress.total_sessions || 0) + 1,
          total_hours: (progress.total_hours || 0) + (elapsedTime / 3600),
          avg_score: ((progress.avg_score || 0) * (progress.total_sessions || 0) + score) / ((progress.total_sessions || 0) + 1),
          best_score: Math.max(progress.best_score || 0, score),
          last_session_date: new Date().toISOString().split('T')[0]
        });
      } else {
        await base44.entities.UserProgress.create({
          user_id: user?.id,
          total_xp: xpEarned,
          total_sessions: 1,
          total_hours: elapsedTime / 3600,
          avg_score: score,
          best_score: score,
          subscription_plan: 'free',
          last_session_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error finishing session:', error);
    }
  };

  const openCamera = (mode, purpose) => {
    setCameraConfig({ open: true, mode, purpose });
  };

  const handleCameraCapture = (imageData, purpose) => {
    // Process camera capture based on purpose
    console.log('Camera captured for:', purpose);
  };

  const handleHome = () => {
    window.location.href = createPageUrl('Dashboard');
  };

  const handleShare = async () => {
    if (navigator.share && currentSession) {
      try {
        await navigator.share({
          title: 'Minha Sessão de Direção',
          text: `Consegui ${currentSession.final_score} pontos na minha aula de direção! 🚗`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-5 flex items-center gap-4">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-[#1E3A5F]">
          {sessionState === 'finished' ? 'Resultado' : 'Nova Aula'}
        </h1>
      </div>

      {/* Content */}
      <div className="px-5 py-5">
        {sessionState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-8 rounded-3xl text-center">
              <div className="w-24 h-24 mx-auto bg-[#1E3A5F]/10 rounded-full flex items-center justify-center mb-6">
                <Play className="h-10 w-10 text-[#1E3A5F]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                Pronto para Começar?
              </h2>
              <p className="text-gray-500 mb-8">
                Posicione o celular no suporte do veículo e inicie a sessão para monitorar sua direção.
              </p>
              <Button
                onClick={startSession}
                className="w-full h-16 bg-[#1E3A5F] hover:bg-[#2d4a6f] text-white rounded-2xl text-lg font-semibold"
              >
                <Play className="h-6 w-6 mr-2" />
                Iniciar Sessão
              </Button>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Dicas</h3>
              <Card className="p-4 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Posicione o celular</p>
                  <p className="text-sm text-gray-500">Fixe em local estável com visão da pista</p>
                </div>
              </Card>
              <Card className="p-4 rounded-2xl flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">GPS Ativo</p>
                  <p className="text-sm text-gray-500">Mantém precisão da rota percorrida</p>
                </div>
              </Card>
              <Card className="p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Dirija com Segurança</p>
                  <p className="text-sm text-gray-500">O app monitora, você foca na direção</p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {sessionState === 'starting' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-16 w-16 text-[#1E3A5F] animate-spin mb-6" />
            <p className="text-lg text-gray-600">Iniciando sessão...</p>
          </div>
        )}

        {sessionState === 'active' && (
          <TelemetryMonitor
            isActive={true}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onOpenCamera={openCamera}
            sessionData={currentSession}
            elapsedTime={elapsedTime}
            onRouteUpdate={handleRouteUpdate}
            currentSpeed={currentSpeed}
            totalDistance={totalDistance}
          />
        )}

        {sessionState === 'finished' && currentSession && (
          <ScoreDisplay
            session={currentSession}
            onShare={handleShare}
            onHome={handleHome}
          />
        )}
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={cameraConfig.open}
        onClose={() => setCameraConfig(prev => ({ ...prev, open: false }))}
        onCapture={handleCameraCapture}
        mode={cameraConfig.mode}
        purpose={cameraConfig.purpose}
      />
    </div>
  );
}
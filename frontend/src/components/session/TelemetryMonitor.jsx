import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LiveMap from './LiveMap';
import { 
  Gauge, AlertTriangle, Eye, Route, 
  Camera, Pause, Play, Square, Clock
} from 'lucide-react';

export default function TelemetryMonitor({ 
  isActive, 
  onPause, 
  onResume, 
  onStop,
  onOpenCamera,
  sessionData,
  elapsedTime,
  onRouteUpdate,
  currentSpeed,
  totalDistance
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const accelerometerRef = useRef(null);



  const addAlert = (message, type = 'info') => {
    const newAlert = { id: Date.now(), message, type };
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
    }, 5000);
  };

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume?.();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Timer and Status */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-[#1E3A5F] to-[#2d4a6f] text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
            <span className="font-medium">
              {isPaused ? 'Pausado' : 'Gravando'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-2xl font-mono font-bold">
            <Clock className="h-5 w-5" />
            {formatTime(elapsedTime || 0)}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {isPaused ? (
            <Button 
              onClick={handleResume}
              className="flex-1 h-14 bg-green-500 hover:bg-green-600 rounded-xl text-lg font-semibold"
            >
              <Play className="h-5 w-5 mr-2" />
              Continuar
            </Button>
          ) : (
            <Button 
              onClick={handlePause}
              variant="outline"
              className="flex-1 h-14 border-white/30 text-white hover:bg-white/10 rounded-xl text-lg font-semibold"
            >
              <Pause className="h-5 w-5 mr-2" />
              Pausar
            </Button>
          )}
          <Button 
            onClick={onStop}
            className="h-14 px-6 bg-red-500 hover:bg-red-600 rounded-xl"
          >
            <Square className="h-5 w-5" />
          </Button>
        </div>
      </Card>



      {/* Camera Controls */}
      <Card className="p-4 rounded-2xl bg-white">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Monitoramento de Câmera</h4>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 h-12 rounded-xl border-[#1E3A5F] text-[#1E3A5F]"
            onClick={() => onOpenCamera?.('front', 'facial')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Atenção
          </Button>
          <Button 
            variant="outline"
            className="flex-1 h-12 rounded-xl border-[#1E3A5F] text-[#1E3A5F]"
            onClick={() => onOpenCamera?.('back', 'lane')}
          >
            <Route className="h-4 w-4 mr-2" />
            Faixa
          </Button>
        </div>
      </Card>

      {/* Speed and Distance Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 rounded-2xl bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Gauge className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Velocidade</span>
          </div>
          <p className="text-2xl font-bold text-[#1E3A5F]">{currentSpeed || 0}<span className="text-sm text-gray-400"> km/h</span></p>
        </Card>

        <Card className="p-4 rounded-2xl bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Route className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Distância</span>
          </div>
          <p className="text-2xl font-bold text-[#1E3A5F]">{(totalDistance || 0).toFixed(2)}<span className="text-sm text-gray-400"> km</span></p>
        </Card>
      </div>

      {/* Live GPS Map */}
      <LiveMap 
        isActive={isActive && !isPaused} 
        onRouteUpdate={onRouteUpdate}
        onSpeedUpdate={() => {}}
        onDistanceUpdate={() => {}}
      />

      {/* Alerts */}
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-2xl flex items-center gap-3 ${
              alert.type === 'warning' 
                ? 'bg-amber-50 border border-amber-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <AlertTriangle className={`h-5 w-5 ${
              alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
            }`} />
            <span className={`text-sm font-medium ${
              alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'
            }`}>
              {alert.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
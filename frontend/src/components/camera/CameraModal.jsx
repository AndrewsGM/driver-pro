import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Camera, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function CameraModal({ 
  isOpen, 
  onClose, 
  onCapture, 
  mode = 'front', // 'front' | 'back'
  purpose = 'facial', // 'facial' | 'distance' | 'lane' | 'sign'
  autoCapture = false,
  title = "Câmera"
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facingMode, setFacingMode] = useState(mode === 'front' ? 'user' : 'environment');
  const [capturedImage, setCapturedImage] = useState(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      setIsLoading(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const confirmCapture = () => {
    if (capturedImage && onCapture) {
      onCapture(capturedImage, purpose);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const getPurposeTitle = () => {
    switch (purpose) {
      case 'facial': return 'Validação Facial';
      case 'distance': return 'Monitorar Distância';
      case 'lane': return 'Detector de Faixa';
      case 'sign': return 'Detectar Placas';
      default: return title;
    }
  };

  const getPurposeInstructions = () => {
    switch (purpose) {
      case 'facial': return 'Posicione seu rosto no centro do quadro';
      case 'distance': return 'Aponte para o veículo à frente';
      case 'lane': return 'Mantenha a câmera apontada para a pista';
      case 'sign': return 'Aponte para a placa de trânsito';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 pt-12">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
            <h2 className="text-white font-semibold text-lg">{getPurposeTitle()}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative h-full w-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-white text-center mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline" className="text-white border-white">
                Tentar Novamente
              </Button>
            </div>
          )}

          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="h-full w-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Face Guide Overlay */}
          {purpose === 'facial' && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-4 border-white/50 rounded-[50%]" />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-0 right-0 text-center px-6">
          <p className="text-white/80 text-sm">{getPurposeInstructions()}</p>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 pb-12">
          <div className="flex items-center justify-center gap-8">
            {!capturedImage ? (
              <Button
                onClick={capturePhoto}
                size="lg"
                className="w-20 h-20 rounded-full bg-white hover:bg-white/90 text-[#1E3A5F]"
              >
                <Camera className="h-8 w-8" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={retakePhoto}
                  size="lg"
                  variant="outline"
                  className="w-16 h-16 rounded-full border-white text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                <Button
                  onClick={confirmCapture}
                  size="lg"
                  className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
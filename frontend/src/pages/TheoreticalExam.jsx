import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle,
  AlertCircle, TrendingUp, Award, BarChart3
} from 'lucide-react';

// Questions will be loaded from the backend
export default function TheoreticalExam() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState('free');
  const [stage, setStage] = useState('intro'); // intro, exam, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes in seconds
  const [startTime, setStartTime] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

        // Load questions from backend
        const questions = await base44.entities.Exam.questions();
        setExamQuestions(questions);
      } catch (e) {
        console.error("Failed to load data", e);
        // Fallback or redirect
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let timer;
    if (stage === 'exam' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const handleStart = () => {
    setStage('exam');
    setStartTime(Date.now());
    setAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(40 * 60);
  };

  const handleAnswer = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setStage('result');
  };

  const calculateResults = () => {
    let correct = 0;
    const categoryStats = {};

    examQuestions.forEach((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correct;

      if (isCorrect) correct++;

      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { correct: 0, total: 0 };
      }
      categoryStats[q.category].total++;
      if (isCorrect) categoryStats[q.category].correct++;
    });

    const score = (correct / examQuestions.length) * 100;
    const passed = correct >= 21; // 70% de aprovação

    return { correct, total: examQuestions.length, score, passed, categoryStats };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#1E3A5F] font-medium">Carregando simulado...</p>
        </div>
      </div>
    );
  }

  // Block access for free and monthly users
  if (subscription === 'free' || subscription === 'monthly') {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <div className="bg-white px-5 pt-10 pb-5 flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Exame Teórico</h1>
        </div>

        <div className="px-5 py-8">
          <Card className="p-8 rounded-3xl text-center">
            <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Award className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
              Simulado Completo
            </h2>
            <p className="text-gray-500 mb-6">
              Pratique com o exame teórico real: 30 questões em 40 minutos com feedback detalhado.
            </p>
            <Link to={createPageUrl('Subscription')}>
              <Button className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold">
                Fazer Upgrade
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const question = examQuestions[currentQuestion];
  const results = stage === 'result' ? calculateResults() : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1E3A5F]">Exame Teórico</h1>
              {stage === 'exam' && (
                <p className="text-xs text-gray-500">
                  Questão {currentQuestion + 1} de {examQuestions.length}
                </p>
              )}
            </div>
          </div>
          {stage === 'exam' && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Intro Stage */}
        {stage === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <Card className="p-6 rounded-3xl">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E3A5F] text-center mb-2">
                Simulado do DETRAN
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Condições reais do exame teórico brasileiro
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    30
                  </div>
                  <span className="text-sm text-gray-700">Questões no total</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Clock className="h-8 w-8 text-amber-600" />
                  <span className="text-sm text-gray-700">40 minutos de duração</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <span className="text-sm text-gray-700">Mínimo de 21 acertos (70%)</span>
                </div>
              </div>

              <Button
                onClick={handleStart}
                className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold"
              >
                Iniciar Simulado
              </Button>
            </Card>

            <Card className="p-5 rounded-3xl">
              <h3 className="font-semibold text-[#1E3A5F] mb-3">Categorias do Exame</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Legislação de Trânsito (10 questões)</p>
                <p>• Direção Defensiva (7 questões)</p>
                <p>• Primeiros Socorros (5 questões)</p>
                <p>• Mecânica Básica (4 questões)</p>
                <p>• Meio Ambiente (4 questões)</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Exam Stage */}
        {stage === 'exam' && question && (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <Progress value={(currentQuestion / examQuestions.length) * 100} className="h-2" />

            <Card className="p-6 rounded-3xl">
              <div className="mb-4">
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  {question.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-6">
                {question.question}
              </h3>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${answers[currentQuestion] === index
                      ? 'bg-purple-600 text-white border-2 border-purple-600'
                      : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                      }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)})</span> {option}
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 h-12 rounded-xl"
              >
                Anterior
              </Button>
              {currentQuestion === examQuestions.length - 1 ? (
                <Button
                  onClick={handleFinish}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl"
                  disabled={Object.keys(answers).length < examQuestions.length}
                >
                  Finalizar
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  Próxima
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-gray-500">
              {Object.keys(answers).length} de {examQuestions.length} respondidas
            </p>
          </motion.div>
        )}

        {/* Result Stage */}
        {stage === 'result' && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <Card className="p-8 rounded-3xl text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${results.passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {results.passed ? (
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${results.passed ? 'text-green-600' : 'text-red-600'
                }`}>
                {results.passed ? 'Aprovado!' : 'Reprovado'}
              </h2>
              <p className="text-gray-500 mb-6">
                Você acertou {results.correct} de {results.total} questões
              </p>
              <div className="text-5xl font-bold text-[#1E3A5F] mb-2">
                {results.score.toFixed(0)}%
              </div>
              <p className="text-sm text-gray-500">
                {results.passed ? 'Parabéns! Você está pronto!' : 'Continue estudando!'}
              </p>
            </Card>

            <Card className="p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-5">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <h3 className="font-bold text-[#1E3A5F]">Desempenho por Categoria</h3>
              </div>

              <div className="space-y-4">
                {Object.entries(results.categoryStats).map(([category, stats]) => {
                  const percentage = (stats.correct / stats.total) * 100;
                  const needsImprovement = percentage < 70;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                        <span className={`text-sm font-bold ${needsImprovement ? 'text-amber-600' : 'text-green-600'
                          }`}>
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${needsImprovement ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {needsImprovement && (
                        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>Recomendamos revisar este conteúdo</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStage('intro')}
                className="flex-1 h-12 rounded-xl"
              >
                Fazer Outro
              </Button>
              <Link to={createPageUrl('Dashboard')} className="flex-1">
                <Button className="w-full h-12 bg-[#1E3A5F] hover:bg-[#2d4a6f] rounded-xl">
                  Voltar
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
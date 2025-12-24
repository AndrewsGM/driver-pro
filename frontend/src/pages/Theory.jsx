import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, BookOpen, CheckCircle2, XCircle,
  ChevronRight, Lightbulb, Award, RefreshCw
} from 'lucide-react';

const theoryTopics = [
  {
    id: 'traffic_signs',
    title: 'Sinalização de Trânsito',
    icon: '🚦',
    questions: [
      {
        id: 1,
        question: 'O que significa uma placa circular vermelha com borda branca?',
        options: ['Proibição', 'Regulamentação', 'Advertência', 'Indicação'],
        correct: 0,
        explanation: 'Placas circulares com fundo vermelho indicam proibição ou restrição.'
      },
      {
        id: 2,
        question: 'Qual é a velocidade máxima permitida em vias locais?',
        options: ['40 km/h', '60 km/h', '30 km/h', '80 km/h'],
        correct: 2,
        explanation: 'Em vias locais, a velocidade máxima é de 30 km/h, salvo sinalização específica.'
      },
      {
        id: 3,
        question: 'Uma placa triangular amarela indica:',
        options: ['Perigo ou advertência', 'Proibição', 'Indicação de serviço', 'Regulamentação'],
        correct: 0,
        explanation: 'Placas triangulares amarelas são de advertência, alertando sobre condições da via.'
      }
    ]
  },
  {
    id: 'right_of_way',
    title: 'Regras de Preferência',
    icon: '🛑',
    questions: [
      {
        id: 1,
        question: 'Em um cruzamento sem sinalização, quem tem preferência?',
        options: ['Quem vem pela direita', 'Quem vem pela esquerda', 'Quem chegou primeiro', 'O veículo maior'],
        correct: 0,
        explanation: 'Em cruzamentos não sinalizados, a preferência é de quem vem pela direita.'
      },
      {
        id: 2,
        question: 'Ao entrar em uma rotatória, o condutor deve:',
        options: ['Dar preferência a quem está na rotatória', 'Acelerar para entrar rápido', 'Buzinar para avisar', 'Piscar farol'],
        correct: 0,
        explanation: 'Quem está dentro da rotatória tem preferência sobre quem está entrando.'
      }
    ]
  },
  {
    id: 'safety',
    title: 'Direção Defensiva',
    icon: '🛡️',
    questions: [
      {
        id: 1,
        question: 'Qual é a distância segura do veículo da frente em condições normais?',
        options: ['2 segundos', '1 segundo', '5 segundos', '10 metros'],
        correct: 0,
        explanation: 'A regra dos 2 segundos ajuda a manter uma distância segura de frenagem.'
      },
      {
        id: 2,
        question: 'Em caso de aquaplanagem, o condutor deve:',
        options: ['Tirar o pé do acelerador e manter a direção', 'Frear bruscamente', 'Acelerar', 'Virar o volante rapidamente'],
        correct: 0,
        explanation: 'Reduzir a velocidade gradualmente sem movimentos bruscos é o mais seguro.'
      }
    ]
  }
];

export default function Theory() {
  const [user, setUser] = useState(null);
  const [stage, setStage] = useState('topics'); // topics, quiz, result
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const startQuiz = (topic) => {
    setCurrentTopic(topic);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setStage('quiz');
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const question = currentTopic.questions[currentQuestion];
    if (index === question.correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentTopic.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setStage('result');
    }
  };

  const resetQuiz = () => {
    setStage('topics');
    setCurrentTopic(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
  };

  const currentQ = currentTopic?.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 flex items-center gap-4">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-[#1E3A5F]">Teoria</h1>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          {stage === 'topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-[#1E3A5F]/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-[#1E3A5F]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                  Estude e Pratique
                </h2>
                <p className="text-gray-500">
                  Escolha um tema para testar seus conhecimentos
                </p>
              </div>

              <div className="space-y-4">
                {theoryTopics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => startQuiz(topic)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                            {topic.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#1E3A5F]">{topic.title}</h3>
                            <p className="text-sm text-gray-500">
                              {topic.questions.length} questões
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'quiz' && currentQ && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{currentTopic.title}</span>
                  <span>{currentQuestion + 1}/{currentTopic.questions.length}</span>
                </div>
                <Progress 
                  value={((currentQuestion + 1) / currentTopic.questions.length) * 100} 
                  className="h-2"
                />
              </div>

              {/* Question */}
              <Card className="p-6 rounded-3xl">
                <h3 className="text-lg font-semibold text-[#1E3A5F] mb-6">
                  {currentQ.question}
                </h3>

                <div className="space-y-3">
                  {currentQ.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQ.correct;
                    const showResult = selectedAnswer !== null;

                    let bgColor = 'bg-gray-50 hover:bg-gray-100';
                    let borderColor = 'border-gray-200';
                    let textColor = 'text-gray-700';

                    if (showResult) {
                      if (isCorrect) {
                        bgColor = 'bg-green-50';
                        borderColor = 'border-green-500';
                        textColor = 'text-green-700';
                      } else if (isSelected && !isCorrect) {
                        bgColor = 'bg-red-50';
                        borderColor = 'border-red-500';
                        textColor = 'text-red-700';
                      }
                    }

                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgColor} ${borderColor} ${textColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option}</span>
                          {showResult && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </Card>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Explicação</p>
                          <p className="text-sm text-blue-700 mt-1">
                            {currentQ.explanation}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Button
                      onClick={nextQuestion}
                      className="w-full h-14 mt-4 bg-[#1E3A5F] hover:bg-[#2d4a6f] rounded-xl text-lg font-semibold"
                    >
                      {currentQuestion < currentTopic.questions.length - 1 
                        ? 'Próxima Questão' 
                        : 'Ver Resultado'}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {stage === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className="p-8 rounded-3xl text-center">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  score.correct === score.total ? 'bg-green-100' : 
                  score.correct >= score.total / 2 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {score.correct === score.total ? (
                    <Award className="h-12 w-12 text-green-600" />
                  ) : (
                    <BookOpen className="h-12 w-12 text-[#1E3A5F]" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
                  {score.correct === score.total ? 'Perfeito!' :
                   score.correct >= score.total / 2 ? 'Bom trabalho!' : 'Continue estudando!'}
                </h2>
                
                <p className="text-gray-500 mb-6">
                  Você acertou {score.correct} de {score.total} questões
                </p>

                <div className="w-32 h-32 mx-auto mb-6">
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ 
                      background: `conic-gradient(#1E3A5F ${(score.correct / score.total) * 100}%, #E5E7EB ${(score.correct / score.total) * 100}%)` 
                    }}
                  >
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#1E3A5F]">
                        {Math.round((score.correct / score.total) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-14 rounded-xl"
                  onClick={() => startQuiz(currentTopic)}
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refazer
                </Button>
                <Button
                  className="h-14 bg-[#1E3A5F] hover:bg-[#2d4a6f] rounded-xl"
                  onClick={resetQuiz}
                >
                  Outros Temas
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
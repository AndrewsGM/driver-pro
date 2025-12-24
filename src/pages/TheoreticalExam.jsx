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

// 30 questões divididas em categorias (exame real brasileiro)
const examQuestions = [
  // Legislação de Trânsito (10 questões)
  { id: 1, category: 'Legislação de Trânsito', question: 'Qual a velocidade máxima permitida em vias locais?', options: ['30 km/h', '40 km/h', '50 km/h', '60 km/h'], correct: 0 },
  { id: 2, category: 'Legislação de Trânsito', question: 'A CNH provisória tem validade de:', options: ['6 meses', '1 ano', '2 anos', '5 anos'], correct: 1 },
  { id: 3, category: 'Legislação de Trânsito', question: 'O que é proibido fazer ao dirigir?', options: ['Usar cinto de segurança', 'Usar celular', 'Ligar setas', 'Olhar retrovisor'], correct: 1 },
  { id: 4, category: 'Legislação de Trânsito', question: 'A distância mínima de parada em farol vermelho é:', options: ['Antes da faixa', 'Sobre a faixa', 'Depois da faixa', 'Não há regra'], correct: 0 },
  { id: 5, category: 'Legislação de Trânsito', question: 'Dirigir sob efeito de álcool é:', options: ['Infração leve', 'Infração média', 'Infração grave', 'Crime'], correct: 3 },
  { id: 6, category: 'Legislação de Trânsito', question: 'O uso do farol baixo é obrigatório:', options: ['Apenas à noite', 'Em rodovias e túneis', 'Só em túneis', 'Nunca'], correct: 1 },
  { id: 7, category: 'Legislação de Trânsito', question: 'Ciclistas têm preferência:', options: ['Sempre', 'Nunca', 'Só em ciclovias', 'Só em cruzamentos'], correct: 0 },
  { id: 8, category: 'Legislação de Trânsito', question: 'A ultrapassagem pela direita é:', options: ['Permitida', 'Proibida', 'Permitida em rodovias', 'Depende da via'], correct: 1 },
  { id: 9, category: 'Legislação de Trânsito', question: 'Estacionar a menos de 5m do cruzamento é:', options: ['Permitido', 'Proibido', 'Permitido à noite', 'Permitido de dia'], correct: 1 },
  { id: 10, category: 'Legislação de Trânsito', question: 'O triângulo de sinalização deve ficar a quantos metros?', options: ['20m', '30m', '40m', '50m'], correct: 1 },
  
  // Direção Defensiva (7 questões)
  { id: 11, category: 'Direção Defensiva', question: 'Qual a distância segura do veículo da frente?', options: ['1 segundo', '2 segundos', '3 segundos', '5 segundos'], correct: 1 },
  { id: 12, category: 'Direção Defensiva', question: 'Ao avistar pedestre atravessando:', options: ['Buzinar', 'Acelerar', 'Parar', 'Desviar'], correct: 2 },
  { id: 13, category: 'Direção Defensiva', question: 'Em neblina, deve-se:', options: ['Ligar farol alto', 'Ligar farol baixo', 'Desligar faróis', 'Ligar pisca-alerta'], correct: 1 },
  { id: 14, category: 'Direção Defensiva', question: 'Ao sentir sono ao dirigir:', options: ['Abrir janela', 'Ouvir música alta', 'Parar e descansar', 'Tomar café'], correct: 2 },
  { id: 15, category: 'Direção Defensiva', question: 'Aquaplanagem é causada por:', options: ['Óleo na pista', 'Água na pista', 'Areia na pista', 'Gelo na pista'], correct: 1 },
  { id: 16, category: 'Direção Defensiva', question: 'Em lombadas, deve-se:', options: ['Acelerar', 'Manter velocidade', 'Reduzir velocidade', 'Frear bruscamente'], correct: 2 },
  { id: 17, category: 'Direção Defensiva', question: 'O condutor defensivo é aquele que:', options: ['Dirige rápido', 'Previne acidentes', 'Buzina muito', 'Acelera bastante'], correct: 1 },
  
  // Primeiros Socorros (5 questões)
  { id: 18, category: 'Primeiros Socorros', question: 'Em caso de hemorragia grave:', options: ['Fazer torniquete', 'Comprimir local', 'Dar água', 'Movimentar vítima'], correct: 1 },
  { id: 19, category: 'Primeiros Socorros', question: 'Vítima de acidente deve:', options: ['Ser removida imediatamente', 'Permanecer no local', 'Ser movida sempre', 'Receber água'], correct: 1 },
  { id: 20, category: 'Primeiros Socorros', question: 'Em caso de queimadura:', options: ['Passar pasta de dente', 'Água fria corrente', 'Passar manteiga', 'Furar bolhas'], correct: 1 },
  { id: 21, category: 'Primeiros Socorros', question: 'SAMU é acionado pelo:', options: ['190', '192', '193', '911'], correct: 1 },
  { id: 22, category: 'Primeiros Socorros', question: 'Vítima inconsciente deve ficar:', options: ['Deitada de costas', 'De lado', 'Sentada', 'De pé'], correct: 1 },
  
  // Mecânica Básica (4 questões)
  { id: 23, category: 'Mecânica Básica', question: 'A pressão dos pneus deve ser verificada:', options: ['Diariamente', 'Semanalmente', 'Mensalmente', 'Anualmente'], correct: 1 },
  { id: 24, category: 'Mecânica Básica', question: 'O nível do óleo deve ser verificado com motor:', options: ['Quente', 'Frio', 'Ligado', 'Acelerado'], correct: 1 },
  { id: 25, category: 'Mecânica Básica', question: 'A calibragem correta dos pneus:', options: ['Aumenta consumo', 'Diminui consumo', 'Não afeta', 'Danifica pneus'], correct: 1 },
  { id: 26, category: 'Mecânica Básica', question: 'Freios rangendo indicam:', options: ['Normal', 'Desgaste', 'Novo', 'Bom estado'], correct: 1 },
  
  // Meio Ambiente (4 questões)
  { id: 27, category: 'Meio Ambiente', question: 'Descartar óleo no esgoto:', options: ['É permitido', 'Polui', 'É normal', 'Não afeta'], correct: 1 },
  { id: 28, category: 'Meio Ambiente', question: 'Catalisador serve para:', options: ['Aumentar potência', 'Reduzir poluição', 'Economizar', 'Aumentar velocidade'], correct: 1 },
  { id: 29, category: 'Meio Ambiente', question: 'Motor regulado:', options: ['Polui mais', 'Polui menos', 'Não afeta', 'Gasta mais'], correct: 1 },
  { id: 30, category: 'Meio Ambiente', question: 'Buzina em excesso:', options: ['É normal', 'Polui sonora', 'É obrigatória', 'Ajuda trânsito'], correct: 1 },
];

export default function TheoreticalExam() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState('free');
  const [stage, setStage] = useState('intro'); // intro, exam, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutos em segundos
  const [startTime, setStartTime] = useState(null);

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
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
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
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      answers[currentQuestion] === index
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
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                results.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {results.passed ? (
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${
                results.passed ? 'text-green-600' : 'text-red-600'
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
                        <span className={`text-sm font-bold ${
                          needsImprovement ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            needsImprovement ? 'bg-amber-500' : 'bg-green-500'
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
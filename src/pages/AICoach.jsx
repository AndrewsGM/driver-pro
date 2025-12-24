import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Send, Brain, Loader2, Sparkles, 
  MessageCircle, TrendingUp, AlertCircle
} from 'lucide-react';

export default function AICoach() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState('free');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou seu Coach IA pessoal. Como posso ajudá-lo a melhorar sua direção hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsUsed, setSessionsUsed] = useState(0);
  const messagesEndRef = useRef(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSessionLimit = () => {
    switch(subscription) {
      case 'monthly': return 5;
      case 'quarterly': return 30;
      case 'annual': return 999999; // Unlimited
      default: return 0;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const limit = getSessionLimit();
    if (sessionsUsed >= limit) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Você atingiu o limite de sessões do seu plano. Faça upgrade para continuar!',
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI integration
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um instrutor de direção IA especializado. Responda de forma clara e educativa. 
        Pergunta do aluno: ${input}
        
        Considere que o aluno está praticando direção e busca melhorar suas habilidades.`,
        add_context_from_internet: false
      });

      const aiMessage = {
        role: 'assistant',
        content: response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionsUsed(prev => prev + 1);
    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Como melhorar minha baliza?',
    'Dicas para dirigir à noite',
    'Como controlar o nervosismo?',
    'Principais erros na prova'
  ];

  if (subscription === 'free') {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <div className="bg-white px-5 pt-10 pb-5 flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Coach IA</h1>
        </div>

        <div className="px-5 py-8">
          <Card className="p-8 rounded-3xl text-center">
            <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <Brain className="h-10 w-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">
              Coach IA Premium
            </h2>
            <p className="text-gray-500 mb-6">
              Tenha um instrutor de IA 24/7 para tirar dúvidas e receber dicas personalizadas.
            </p>
            <Link to={createPageUrl('Subscription')}>
              <Button className="w-full h-14 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold">
                Desbloquear Coach IA
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const limit = getSessionLimit();
  const isUnlimited = subscription === 'annual';

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5 text-[#1E3A5F]" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1E3A5F]">Coach IA</h1>
              <p className="text-xs text-gray-500">
                {isUnlimited ? 'Ilimitado' : `${sessionsUsed}/${limit} sessões usadas`}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        {!isUnlimited && (
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all"
              style={{ width: `${(sessionsUsed / limit) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-[#1E3A5F] text-white'
                  : message.role === 'system'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-white text-gray-800'
              } p-4 rounded-2xl ${
                message.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
              }`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">Coach IA</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white p-4 rounded-2xl rounded-bl-md">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            </div>
          </motion.div>
        )}

        {messages.length === 1 && (
          <div className="space-y-3 mt-6">
            <p className="text-sm text-gray-500 text-center mb-3">Perguntas rápidas:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-3 px-4 text-xs rounded-xl border-gray-200 text-left whitespace-normal"
                  onClick={() => {
                    setInput(question);
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua dúvida..."
            className="flex-1 h-12 rounded-xl border-gray-200"
            disabled={isLoading || (!isUnlimited && sessionsUsed >= limit)}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || (!isUnlimited && sessionsUsed >= limit)}
            className="h-12 w-12 rounded-xl bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
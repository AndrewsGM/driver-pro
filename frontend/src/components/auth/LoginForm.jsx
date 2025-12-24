import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Scan, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

export default function LoginForm({ onCPFLogin, onFacialLogin, isLoading }) {
  const [cpf, setCPF] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const handleCPFChange = (e) => {
    setCPF(formatCPF(e.target.value));
    if (errors.cpf) setErrors(prev => ({ ...prev, cpf: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const cpfNumbers = cpf.replace(/\D/g, '');
    
    if (cpfNumbers.length !== 11) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onCPFLogin({ cpf: cpf.replace(/\D/g, ''), password });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="cpf" className="text-[#1E3A5F] font-medium">CPF</Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCPFChange}
            className={`h-14 text-lg border-2 rounded-xl focus:border-[#1E3A5F] transition-all ${
              errors.cpf ? 'border-red-500' : 'border-gray-200'
            }`}
            disabled={isLoading}
          />
          {errors.cpf && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.cpf}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#1E3A5F] font-medium">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: null }));
              }}
              className={`h-14 text-lg border-2 rounded-xl pr-12 focus:border-[#1E3A5F] transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-[#1E3A5F] hover:bg-[#2d4a6f] text-white rounded-xl text-lg font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Entrar
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">ou</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-16 border-2 border-[#1E3A5F] text-[#1E3A5F] rounded-xl text-lg font-semibold hover:bg-[#1E3A5F] hover:text-white transition-all"
        onClick={onFacialLogin}
        disabled={isLoading}
      >
        <Scan className="h-6 w-6 mr-3" />
        Validação Facial
      </Button>

      <p className="text-center text-gray-500 text-sm">
        Não possui conta?{' '}
        <button className="text-[#1E3A5F] font-semibold hover:underline">
          Cadastre-se
        </button>
      </p>
    </div>
  );
}
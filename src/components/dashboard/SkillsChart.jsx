import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { ParkingCircle, Car, Moon, Building, RotateCcw } from 'lucide-react';

const skillConfig = [
  { key: 'parking', label: 'Baliza', icon: ParkingCircle, color: '#3B82F6' },
  { key: 'highway', label: 'Rodovia', icon: Car, color: '#10B981' },
  { key: 'night_driving', label: 'Noturna', icon: Moon, color: '#8B5CF6' },
  { key: 'urban', label: 'Urbano', icon: Building, color: '#F59E0B' },
  { key: 'maneuvers', label: 'Manobras', icon: RotateCcw, color: '#EF4444' },
];

export default function SkillsChart({ skills = {} }) {
  return (
    <Card className="p-6 rounded-3xl bg-white border-0 shadow-sm">
      <h3 className="text-lg font-semibold text-[#1E3A5F] mb-6">Suas Habilidades</h3>
      
      <div className="space-y-4">
        {skillConfig.map((skill, index) => {
          const value = skills[skill.key] || 0;
          const Icon = skill.icon;
          
          return (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${skill.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: skill.color }} />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                  <span className="text-sm font-semibold" style={{ color: skill.color }}>
                    {value}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
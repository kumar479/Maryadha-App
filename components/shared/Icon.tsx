import React from 'react';
import { icons } from 'lucide-react-native';

interface IconProps {
  name: keyof typeof icons;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 24, color }: IconProps) {
  const LucideIcon = icons[name];
  return <LucideIcon size={size} color={color} />;
} 
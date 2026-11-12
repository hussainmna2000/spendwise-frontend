import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { ExpenseCategory } from '../types/finance';
import { CATEGORY_COLORS } from '../utils/formatters';

interface CategoryIconProps {
  category: ExpenseCategory;
  size?: number;
  withContainer?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 16,
  withContainer = true,
}) => {
  const colorMeta = CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;

  const renderIcon = () => {
    switch (category) {
      case 'Food':
        return <Utensils size={size} className={colorMeta.textClass} />;
      case 'Transportation':
        return <Car size={size} className={colorMeta.textClass} />;
      case 'Shopping':
        return <ShoppingBag size={size} className={colorMeta.textClass} />;
      case 'Bills':
        return <Receipt size={size} className={colorMeta.textClass} />;
      case 'Entertainment':
        return <Film size={size} className={colorMeta.textClass} />;
      case 'Healthcare':
        return <HeartPulse size={size} className={colorMeta.textClass} />;
      case 'Education':
        return <GraduationCap size={size} className={colorMeta.textClass} />;
      case 'Others':
      default:
        return <Layers size={size} className={colorMeta.textClass} />;
    }
  };

  if (!withContainer) {
    return renderIcon();
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${colorMeta.bgSubtleClass}`}
      aria-hidden="true"
    >
      {renderIcon()}
    </span>
  );
};

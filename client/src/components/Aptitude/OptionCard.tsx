import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

interface OptionCardProps {
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean | null;
  isRevealed: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const OptionCard = memo(function OptionCard({
  text,
  index,
  isSelected,
  isCorrect,
  isRevealed,
  disabled,
  onSelect,
}: OptionCardProps) {
  const label = String.fromCharCode(65 + index);

  let borderClass = 'dark:border-white/10 light:border-gray-200 hover:dark:border-white/20 hover:light:border-gray-300';
  let bgClass = 'dark:bg-white/5 light:bg-gray-50 hover:dark:bg-white/[0.07] hover:light:bg-gray-100';
  let glowClass = '';
  let IconComponent = null;
  let iconColor = '';

  if (isRevealed && isSelected) {
    if (isCorrect) {
      borderClass = 'border-green-500/50';
      bgClass = 'bg-green-500/10';
      glowClass = 'shadow-[0_0_30px_rgba(34,197,94,0.15)]';
      IconComponent = CheckCircle2;
      iconColor = 'text-green-400';
    } else {
      borderClass = 'border-red-500/50';
      bgClass = 'bg-red-500/10';
      glowClass = 'shadow-[0_0_30px_rgba(239,68,68,0.15)]';
      IconComponent = XCircle;
      iconColor = 'text-red-400';
    }
  }

  return (
    <motion.button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      className={`w-full p-4 rounded-2xl border transition-all duration-300 text-left flex items-center gap-4 ${borderClass} ${bgClass} ${glowClass} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-semibold transition-colors duration-300 ${
        isRevealed && isSelected
          ? isCorrect
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
          : 'dark:bg-white/10 light:bg-gray-200 dark:text-gray-300 light:text-gray-700'
      }`}>
        {label}
      </div>

      <span className="dark:text-white light:text-gray-900 text-sm leading-relaxed flex-1">{text}</span>

      {IconComponent && (
        <IconComponent className={`w-5 h-5 shrink-0 ${iconColor}`} />
      )}
    </motion.button>
  );
});

export default OptionCard;

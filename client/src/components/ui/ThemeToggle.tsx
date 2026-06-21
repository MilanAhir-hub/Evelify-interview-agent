import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../theme/useTheme';
import type { ThemeMode } from '../../theme/colors';

const ThemeToggle = () => {
  const { mode, effectiveTheme, setMode } = useTheme();

  const modes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: 'System' },
  ];

  const currentIndex = modes.findIndex(m => m.value === mode);

  return (
    <div className="relative flex items-center gap-0.5 sm:gap-1 p-1 rounded-lg sm:rounded-xl dark:bg-white/5 light:bg-gray-200/50 dark:border-white/5 light:border-gray-200/50">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className={`
            relative z-10 p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all duration-300 focus:outline-none
            ${mode === m.value 
              ? effectiveTheme === 'dark' 
                ? 'text-white' 
                : 'text-gray-900'
              : effectiveTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }
          `}
          title={m.label}
        >
          <span className="relative z-10 flex items-center justify-center">{m.icon}</span>
          {mode === m.value && (
            <motion.div
              layoutId="activeTheme"
              className={`
                absolute inset-0 rounded-md sm:rounded-lg z-0
                ${effectiveTheme === 'dark' 
                  ? 'bg-white/10 border border-white/5' 
                  : 'bg-white border border-gray-200 shadow-sm'
                }
              `}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
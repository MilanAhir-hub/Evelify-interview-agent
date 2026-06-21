import React, { useState, useRef, useEffect, type ReactNode } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown = ({ trigger, children, align = 'right', className = '' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-3 w-56 dark:bg-[#111111] light:bg-white dark:border-white/10 light:border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in duration-200 origin-top-${align}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

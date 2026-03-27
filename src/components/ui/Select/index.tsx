'use client';

import { useState, useRef, useEffect } from 'react';
import s from './styles.module.scss';

export type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const Select = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`${s.root} ${className}`} ref={rootRef}>
      <button 
        type="button" 
        className={`${s.trigger} ${isOpen ? s.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={s.value}>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg 
          className={s.arrow} 
          width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <ul className={s.dropdown}>
          {options.map((option) => (
            <li 
              key={option.value}
              className={`${s.option} ${option.value === value ? s.selected : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

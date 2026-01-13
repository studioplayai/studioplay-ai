import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold transition-all duration-300 rounded-2xl focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0";
  
  const variants = {
    primary: "text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 shadow-lg shadow-purple-500/40 border border-white/10",
    secondary: "text-white bg-slate-800 hover:bg-slate-700 border border-slate-600/50 shadow-md",
    glass: "text-white bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 shadow-sm",
    ghost: "text-slate-300 hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </span>
      ) : null}
      {children}
    </button>
  );
};
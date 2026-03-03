import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'danger';
    loading?: boolean;
}

export const Button = ({ children, variant = 'primary', loading, ...props} : ButtonProps) => {

  const varients = {
    primary : 'bg-warrior-orange text-white hover:scale-105 duration-200',
    outline : 'border border-warrior-orange text-warrior-orange hover:bg-warrior-orange hover:text-white',
    danger : 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full flex-1 py-3 px-4 font-bold rounded transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${varients[variant]}`}
    >
        {loading ? <span className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></span> : children}
    </button>
  )
}


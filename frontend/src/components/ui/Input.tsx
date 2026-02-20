import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
export const Input = ({ label, ...props }: InputProps) =>  (
    <div className='w-full space-y-1'>
      {label && <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>}
      <input 
        {...props}
        className='w-full px-4 py-3 rounded text-gray-300 bg-warrior-dark border border-neutral-700 focus:border-warrior-orange outline-none transition-all duration-200'
      />
    </div>
)



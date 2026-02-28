import type { IconType } from "react-icons";

interface StatCardProps {
    title: string,
    value: string | number;
    icon: IconType;
    trend?: string; //e.g. "+2 this month"
    variant: 'orange' | 'red' | 'blue' | 'green' | 'yellow';
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = 'orange' } : StatCardProps) => {

    const themes = {
        orange : 'border-l-warrior-orange border-neutral-700  text-warrior-orange',
        red : 'border-l-warrior-red border-neutral-700  text-warrior-red',
        blue : 'border-l-blue-500 border-neutral-700  text-blue-500',
        green: 'border-l-green-500 border-neutral-700  text-green-500',
        yellow: 'border-l-amber-500 border-neutral-700  text-amber-500',
        
    }

    return (
        <div className={`p-6 rounded-xl bg-warrior-grey border border-l-3 ${themes[variant]} shadow-sm`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-400 font-medium  uppercase tracking-wider">{title}</p>
                    <h3 className="text-xl md:text-2xl font-bold mt-1 text-gray-300">{value}</h3>
                    {trend && <p className="text-xs mt-2 text-green-500 font-medium">{trend}</p> }
                </div>
                <div className={`p-1 rounded-lg bg-neutral-800 ${themes[variant].split(' ')[1]}`}>
                    <Icon size={32}/>
                </div>
            </div>
        
        </div>
    )
}



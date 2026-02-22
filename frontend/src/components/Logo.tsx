import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    theme?: 'light' | 'dark'; // 'dark' = white text (for dark backgrounds), 'light' = dark text (for light backgrounds)
}

const Logo: React.FC<LogoProps> = ({ className, iconOnly = false, size = 'md', theme = 'dark' }) => {
    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-14 h-14'
    };

    const containerSizes = {
        sm: 'w-8 h-8 rounded-lg',
        md: 'w-12 h-12 rounded-xl',
        lg: 'w-16 h-16 rounded-2xl',
        xl: 'w-20 h-20 rounded-[24px]'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-5xl'
    };

    return (
        <div className={cn("flex items-center gap-4", className)}>
            <div className={cn(
                "bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-xl shadow-brand-500/20 rotate-3",
                containerSizes[size]
            )}>
                <ShieldCheck className={cn("text-white", iconSizes[size])} />
            </div>
            {!iconOnly && (
                <span className={cn(
                    "font-black tracking-tighter transition-colors",
                    textSizes[size],
                    theme === 'dark' ? "text-slate-50" : "text-slate-900"
                )}>
                    Bika<span className="text-brand-500">Safe</span>
                </span>
            )}
        </div>
    );
};

export default Logo;

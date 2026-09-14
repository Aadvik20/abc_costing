import { X, CheckIcon, Info, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. Define supported types for better variety
type ToastType = 'success' | 'error' | 'warning' | 'info';

type CustomToastProps = {
  t: any;
  title?: string;
  message: string;
  type?: ToastType;
};

// 2. Configuration mapping for styles and icons
const toastConfig: Record<
  ToastType,
  {
    colorClass: string;
    bgClass: string;
    gradient: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 border-emerald-100',
    gradient: 'from-emerald-400 to-teal-500',
    icon: <CheckIcon size={24} />,
  },
  error: {
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50 border-rose-100',
    gradient: 'from-rose-400 to-red-500',
    icon: <X size={24} />,
  },
  warning: {
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-100',
    gradient: 'from-amber-400 to-orange-500',
    icon: <AlertTriangle size={24} />,
  },
  info: {
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-100',
    gradient: 'from-blue-400 to-indigo-500',
    icon: <Info size={24} />,
  },
};

const CustomToast = ({ t, title, message, type = 'success' }: CustomToastProps) => {
  const config = toastConfig[type];

  return (
    <div
      className={`
        w-[380px] sm:w-[420px] bg-white rounded-2xl 
        shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] 
        border border-gray-100 p-4 relative overflow-hidden transition-all
        ${t.visible ? 'animate-enter' : 'animate-leave'}
      `}
    >
      {/* Decorative side accent instead of a full top bar for a cleaner look */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b ${config.gradient}`} />

      <div className="flex items-start gap-4">
        {/* Modern Minimal Icon Circle */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.bgClass} ${config.colorClass}`}>{config.icon}</div>

        {/* Content */}
        <div className="flex-1">
          {title && <h3 className="text-[15px] font-bold text-gray-900 leading-none mb-1">{title}</h3>}
          <p className="text-sm text-gray-500 font-medium leading-snug">{message}</p>
        </div>

        {/* Improved Close Button */}
        <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default CustomToast;

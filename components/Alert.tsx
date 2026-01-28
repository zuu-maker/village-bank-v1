import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "../utils/helpers";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styleMap = {
  success: {
    container: "bg-bank-50 border-bank-200",
    icon: "text-bank-600",
    title: "text-bank-800",
    message: "text-bank-700",
  },
  error: {
    container: "bg-red-50 border-red-200",
    icon: "text-red-600",
    title: "text-red-800",
    message: "text-red-700",
  },
  warning: {
    container: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
    title: "text-amber-800",
    message: "text-amber-700",
  },
  info: {
    container: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    title: "text-blue-800",
    message: "text-blue-700",
  },
};

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className,
}) => {
  const Icon = iconMap[type];
  const styles = styleMap[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        styles.container,
        className,
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", styles.icon)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("font-semibold mb-1", styles.title)}>{title}</p>
        )}
        <p className={cn("text-sm", styles.message)}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/50 transition-colors"
        >
          <X className="w-4 h-4 text-forest-500" />
        </button>
      )}
    </div>
  );
};

export default Alert;

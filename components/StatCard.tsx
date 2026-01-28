"use client";
import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../utils/helpers";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "green" | "blue" | "amber" | "purple" | "red";
  className?: string;
}

const colorMap = {
  green: {
    gradient: "from-bank-500 via-bank-600 to-bank-500",
    light: "from-bank-100 to-bank-50",
    text: "text-bank-600",
    border: "border-bank-200",
    hoverBorder: "group-hover:border-bank-300",
    glow: "group-hover:shadow-bank-500/20",
  },
  blue: {
    gradient: "from-blue-500 via-blue-600 to-blue-500",
    light: "from-blue-100 to-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    hoverBorder: "group-hover:border-blue-300",
    glow: "group-hover:shadow-blue-500/20",
  },
  amber: {
    gradient: "from-amber-500 via-amber-600 to-amber-500",
    light: "from-amber-100 to-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    hoverBorder: "group-hover:border-amber-300",
    glow: "group-hover:shadow-amber-500/20",
  },
  purple: {
    gradient: "from-purple-500 via-purple-600 to-purple-500",
    light: "from-purple-100 to-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    hoverBorder: "group-hover:border-purple-300",
    glow: "group-hover:shadow-purple-500/20",
  },
  red: {
    gradient: "from-red-500 via-red-600 to-red-500",
    light: "from-red-100 to-red-50",
    text: "text-red-600",
    border: "border-red-200",
    hoverBorder: "group-hover:border-red-300",
    glow: "group-hover:shadow-red-500/20",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "green",
  className,
}) => {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-white p-6 border border-forest-100",
        "transition-all duration-300 hover:shadow-2xl",
        colors.hoverBorder,
        colors.glow,
        "animate-scale-in",
        className,
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r rounded-t-2xl",
          "transition-all duration-300 opacity-50 group-hover:opacity-100 group-hover:h-1.5",
          colors.gradient,
        )}
      />

      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-forest-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl lg:text-4xl font-display font-bold text-forest-900 tracking-tight mt-2">
              {value}
            </p>
          </div>

          {subtitle && (
            <p className="text-sm text-forest-500 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}

          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold",
                trend.isPositive
                  ? "bg-bank-50 text-bank-700"
                  : "bg-red-50 text-red-700",
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-forest-400 font-normal ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="relative flex-shrink-0 ml-4">
          {/* Glow effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br blur-xl opacity-0 group-hover:opacity-30 transition-all duration-300",
              colors.gradient,
            )}
          />

          <div
            className={cn(
              "relative w-16 h-16 lg:w-18 lg:h-18 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br shadow-lg transition-all duration-300",
              "group-hover:scale-110 group-hover:rotate-3",
              colors.gradient,
            )}
          >
            <Icon className="w-8 h-8 lg:w-9 lg:h-9 text-white drop-shadow-sm" />

            {/* Shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>

      {/* Decorative bottom accent */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl",
          "bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-300",
          colors.gradient,
        )}
      />
    </div>
  );
};

export default StatCard;

"use client";
import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  height?: number;
}

export default function AnalyticsChart({ 
  data, 
  title, 
  color = '#8B5CF6',
  height = 200 
}: AnalyticsChartProps) {
  const { maxValue, normalizedData } = useMemo(() => {
    const max = Math.max(...data.map(d => d.value), 1);
    return {
      maxValue: max,
      normalizedData: data.map(d => ({
        ...d,
        height: (d.value / max) * 100,
      })),
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-end gap-2" style={{ height }}>
        {normalizedData.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="relative w-full flex justify-center mb-2">
              <div
                className="w-full max-w-[40px] rounded-t-md transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${Math.max(point.height, 4)}%`,
                  backgroundColor: color,
                  minHeight: '4px',
                }}
                title={`${point.label}: ${point.value.toLocaleString()}`}
              />
            </div>
            <span className="text-xs text-gray-500 truncate max-w-full">
              {point.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-400">
        <span>0</span>
        <span>{maxValue.toLocaleString()}</span>
      </div>
    </div>
  );
}

// Mini sparkline chart for cards
interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = '#8B5CF6', width = 80, height = 24 }: SparklineProps) {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Donut chart for distribution
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ data, size = 120 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let offset = 0;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((segment, index) => {
          const percentage = segment.value / total;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = -offset * circumference;
          offset += percentage;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Style merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatter
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

// Random Captcha Generator
export function generateCaptcha(length = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Mock delay for async operations
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 防抖函数 (Debounce)
 * 限制函数在一定时间内只能执行一次，最后一次触发生效。
 * 适用于搜索输入框等高频触发场景。
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 节流函数 (Throttle)
 * 限制函数在一定时间内只能执行一次，规定时间内多次触发只有一次生效。
 * 适用于按钮点击防抖、滚动事件监听等。
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
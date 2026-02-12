import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { APP_CONFIG } from '../config';

// --- Types ---
interface AppState {
  themeMode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: number;
  pageTransition: 'fade' | 'slide' | 'scale' | 'none'; // Added transition type
  user: any | null;
}

type Action = 
  | { type: 'SET_THEME_MODE'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_PRIMARY_COLOR'; payload: string }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_PAGE_TRANSITION'; payload: 'fade' | 'slide' | 'scale' | 'none' } // Added action
  | { type: 'SET_USER'; payload: any }
  | { type: 'LOGOUT' };

// --- Initial State ---
const initialState: AppState = {
  themeMode: 'light',
  primaryColor: '#2563eb',
  fontSize: 16,
  pageTransition: 'fade', // Default transition
  user: null,
};

// --- Reducer ---
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.payload };
    case 'SET_PRIMARY_COLOR':
      return { ...state, primaryColor: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'SET_PAGE_TRANSITION':
      return { ...state, pageTransition: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};

// --- Context ---
const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

// --- Provider ---
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化：从 LocalStorage 读取配置
  useEffect(() => {
    const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.mode) dispatch({ type: 'SET_THEME_MODE', payload: parsed.mode });
        if (parsed.color) dispatch({ type: 'SET_PRIMARY_COLOR', payload: parsed.color });
        if (parsed.fontSize) dispatch({ type: 'SET_FONT_SIZE', payload: parsed.fontSize });
        if (parsed.pageTransition) dispatch({ type: 'SET_PAGE_TRANSITION', payload: parsed.pageTransition });
      } catch (e) {
        console.error("Failed to parse theme settings");
      }
    }
  }, []);

  // 监听 State 变化保存到 LocalStorage
  useEffect(() => {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, JSON.stringify({
        mode: state.themeMode,
        color: state.primaryColor,
        fontSize: state.fontSize,
        pageTransition: state.pageTransition
      }));
  }, [state.themeMode, state.primaryColor, state.fontSize, state.pageTransition]);

  // 应用主题模式
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (state.themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = state.themeMode === 'dark';
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (state.themeMode === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);

  }, [state.themeMode]);

  // 应用主题色
  useEffect(() => {
     document.documentElement.style.setProperty('--primary', state.primaryColor);
     document.documentElement.style.setProperty('--primary-hover', state.primaryColor); 
  }, [state.primaryColor]);

  // 应用字体大小
  useEffect(() => {
    document.documentElement.style.fontSize = `${state.fontSize}px`;
  }, [state.fontSize]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// --- Hook ---
export const useStore = () => useContext(StoreContext);
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-600 mb-6 dark:bg-blue-900/20 dark:text-blue-400">
          <FileQuestion size={48} />
        </div>
        <h1 className="text-6xl font-bold text-slate-800 mb-2 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4 dark:text-slate-300">Page Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto dark:text-slate-400">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          返回首页
        </Button>
      </div>
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/Button';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 text-red-600 mb-6 dark:bg-red-900/20 dark:text-red-400">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-6xl font-bold text-slate-800 mb-2 dark:text-white">403</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4 dark:text-slate-300">Access Forbidden</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto dark:text-slate-400">
          抱歉，您没有权限访问此页面。请联系管理员以获取必要的访问权限。
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(-1)} variant="secondary">
            返回上一页
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            回到首页
          </Button>
        </div>
      </div>
    </div>
  );
};
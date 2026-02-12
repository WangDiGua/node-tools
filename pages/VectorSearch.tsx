import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export const VectorSearch: React.FC = () => {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">向量搜索</h1>
            <p className="text-slate-500 dark:text-slate-400">在向量数据库中执行语义相似度搜索。</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px] dark:bg-slate-900 dark:border-slate-800">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 dark:bg-blue-900/20">
                <Search size={32} />
            </div>
            <div className="w-full max-w-xl space-y-4">
                <Input 
                    placeholder="输入文本以搜索相似向量..." 
                    className="h-12 text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <div className="flex justify-center gap-3">
                    <Button size="lg">开始搜索</Button>
                    <Button variant="secondary" size="lg" className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">高级选项</Button>
                </div>
            </div>
        </div>
    </div>
  );
};
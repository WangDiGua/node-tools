import React from 'react';
import { Book, Settings, Save } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const KBConfig: React.FC = () => {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">知识库配置</h1>
            <p className="text-slate-500 dark:text-slate-400">管理和配置您的知识库参数及索引策略。</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center dark:bg-indigo-900/20 dark:text-indigo-400">
                    <Book size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">默认知识库设置</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">配置全局默认的检索参数与分片策略</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="知识库名称" placeholder="Default KB" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                <Input label="索引分片大小 (Chunk Size)" placeholder="512" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">检索模式</label>
                    <select className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <option>Hybrid (混合检索)</option>
                        <option>Dense (向量检索)</option>
                        <option>Sparse (关键词检索)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">Embedding 模型</label>
                    <select className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <option>text-embedding-3-small</option>
                        <option>text-embedding-3-large</option>
                        <option>m3e-base</option>
                    </select>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <Button>
                    <Save size={16} className="mr-2" /> 保存配置
                </Button>
            </div>
        </div>
    </div>
  );
};
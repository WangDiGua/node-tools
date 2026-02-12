import React, { useState } from 'react';
import { Search, FileText, ArrowRight, Zap } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { cn } from '../utils';

export const KBRetrieval: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
        setResults([
            { id: 1, content: '向量数据库是一种专门用于存储、管理和查询向量数据的数据库系统。', score: 0.92, source: '技术白皮书_v1.pdf' },
            { id: 2, content: 'Embeddings 是数据的向量表示，使得语义相似的数据在向量空间中距离更近。', score: 0.88, source: 'API_Docs.md' },
            { id: 3, content: 'Hybrid Search 结合了关键词搜索和向量搜索的优势，提高了检索的准确性。', score: 0.85, source: 'Architecture_Review.pptx' },
        ]);
        setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">知识库检索</h1>
            <p className="text-slate-500 dark:text-slate-400">在已配置的知识库中进行精确或语义检索测试。</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
             <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex gap-2">
                    <Input 
                        placeholder="输入查询语句，例如：什么是向量数据库？" 
                        leftIcon={<Search size={18} />} 
                        className="h-12 text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                    />
                    <Button size="lg" onClick={handleSearch} isLoading={loading} className="w-32">
                        检索
                    </Button>
                </div>
                
                <div className="flex gap-4 justify-center text-sm text-slate-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="mode" defaultChecked /> 语义检索
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="mode" /> 混合检索
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="mode" /> 精确匹配
                    </label>
                </div>
             </div>
        </div>

        {results.length > 0 && (
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                    <Zap size={18} className="mr-2 text-yellow-500" /> 检索结果
                </h3>
                {results.map((res) => (
                    <div key={res.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
                        <p className="text-slate-800 mb-3 leading-relaxed dark:text-slate-200">{res.content}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 pt-3 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <FileText size={14} /> 
                                <span>{res.source}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded dark:bg-green-900/20 dark:text-green-400">Score: {res.score}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
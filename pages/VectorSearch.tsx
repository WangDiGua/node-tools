import React, { useState } from 'react';
import { Search, Database, FileText, Loader2, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Pagination } from '../components/Pagination';
import { cn } from '../utils';

// Mock Vector Collections
const VECTOR_COLLECTIONS = [
    { id: 'vec_1', name: '企业知识库_Wiki', count: 12050 },
    { id: 'vec_2', name: '产品文档_V2.0', count: 8500 },
    { id: 'vec_3', name: '客户问答集_Q4', count: 3200 },
    { id: 'vec_4', name: '法律法规库', count: 15000 },
    { id: 'vec_5', name: '代码片段索引', count: 45000 },
];

export const VectorSearch: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState(VECTOR_COLLECTIONS[0].id);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock Results
    const mockResults = Array.from({ length: 5 }).map((_, i) => ({
        id: `res_${Date.now()}_${i}`,
        content: `这是关于 "${query}" 的搜索结果片段 ${i + 1}。这里通常包含从向量数据库检索回来的原始文本块，用于大模型上下文增强。在实际场景中，这里会展示具体的业务数据内容...`,
        score: (0.95 - (i * 0.05)).toFixed(4),
        source: `document_${i+1}.pdf`,
        metadata: { page: i + 12, chunk_id: 1024 + i }
    }));
    
    setResults(mockResults);
    setLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Left Sidebar: Vector Collections */}
      <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                  <Database size={16} className="mr-2 text-blue-500" /> 向量库列表
              </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {VECTOR_COLLECTIONS.map(col => (
                  <button
                      key={col.id}
                      onClick={() => setSelectedCollection(col.id)}
                      className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group",
                          selectedCollection === col.id 
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                              : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                      )}
                  >
                      <div className="truncate font-medium">{col.name}</div>
                      <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full",
                          selectedCollection === col.id ? "bg-blue-100 dark:bg-blue-800" : "bg-slate-100 text-slate-400 dark:bg-slate-700"
                      )}>{(col.count / 1000).toFixed(1)}k</span>
                  </button>
              ))}
          </div>
      </div>

      {/* Right Content: Search & Results */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Search Box */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="relative">
                  <Input 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="输入查询语句，例如：系统如何处理并发请求？" 
                      className="pr-24 h-12 text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <div className="absolute right-1 top-1 bottom-1">
                      <Button onClick={handleSearch} disabled={loading} className="h-full px-6">
                          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                          <span className="ml-2">搜索</span>
                      </Button>
                  </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                   <label className="flex items-center cursor-pointer hover:text-blue-600"><input type="radio" name="search_type" defaultChecked className="mr-1" /> 语义检索 (Dense)</label>
                   <label className="flex items-center cursor-pointer hover:text-blue-600"><input type="radio" name="search_type" className="mr-1" /> 混合检索 (Hybrid)</label>
                   <span className="ml-auto">Top K: 5</span>
              </div>
          </div>

          {/* Results List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0 dark:bg-slate-900 dark:border-slate-800">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center dark:border-slate-800">
                   <h3 className="font-semibold text-slate-800 dark:text-white flex items-center">
                       <Zap size={16} className="mr-2 text-yellow-500" /> 检索结果
                   </h3>
                   {hasSearched && <span className="text-xs text-slate-500">耗时: 142ms</span>}
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                   {!hasSearched ? (
                       <div className="h-full flex flex-col items-center justify-center text-slate-400">
                           <Search size={48} className="mb-4 opacity-20" />
                           <p>请在上方输入内容开始测试向量检索效果</p>
                       </div>
                   ) : results.length === 0 ? (
                       <div className="h-full flex items-center justify-center text-slate-400">未找到相关结果</div>
                   ) : (
                       results.map((res) => (
                           <div key={res.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50/30 hover:border-blue-100 transition-all group dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-blue-900/10 dark:hover:border-blue-800">
                               <div className="flex justify-between items-start mb-2">
                                   <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                       <span className="bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center dark:bg-slate-800 dark:border-slate-600">
                                           <FileText size={12} className="mr-1" /> {res.source}
                                       </span>
                                       <span className="font-mono opacity-70">Chunk: {res.metadata.chunk_id}</span>
                                   </div>
                                   <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded dark:bg-green-900/20 dark:text-green-400">
                                       Score: {res.score}
                                   </span>
                               </div>
                               <p className="text-sm text-slate-700 leading-relaxed dark:text-slate-300">
                                   {res.content}
                               </p>
                           </div>
                       ))
                   )}
               </div>

               {/* Pagination */}
               {results.length > 0 && (
                   <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                       <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};
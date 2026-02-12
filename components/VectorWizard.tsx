import React, { useState } from 'react';
import { Database, Table as TableIcon, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Pagination } from './Pagination';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Data Types (Re-used for simplicity, in real app move to types/api) ---
export interface DatabaseItem { id: string; name: string; type: string; }
export interface TableItem { id: string; name: string; rows: number; }
export interface FieldItem { id: string; name: string; type: string; }

// --- Props ---
interface VectorWizardProps {
  onFinish: (data: any) => void;
  onCancel: () => void;
  databases: DatabaseItem[];
  getTables: (dbId: string) => TableItem[];
  getFields: (tableId: string) => FieldItem[];
}

export const VectorWizard: React.FC<VectorWizardProps> = ({ 
    onFinish, 
    onCancel, 
    databases, 
    getTables, 
    getFields 
}) => {
  // Wizard State
  const [step, setStep] = useState(0); 
  const [data, setData] = useState({
      title: '',
      dbId: '',
      tableId: '',
      fieldIds: [] as string[]
  });
  
  // Pagination State
  const [dbPage, setDbPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [progress, setProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

  // Logic
  const startVectorization = async () => {
    setProcessStatus('processing');
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 5; 
        });
    }, 100);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    clearInterval(interval);
    setProgress(100);
    setProcessStatus('completed');
  };

  const handleFinish = () => {
      onFinish(data);
  };

  // --- Renders ---

  const renderStep0 = () => (
      <div className="flex flex-col justify-center items-center h-full">
          <div className="w-full max-w-md">
            <h3 className="text-xl font-medium text-slate-800 mb-8 text-center">首先，请为向量集命名</h3>
            <Input 
                label="向量标题" 
                placeholder="例如：产品知识库 V1.0" 
                value={data.title}
                onChange={(e) => setData({...data, title: e.target.value})}
                autoFocus
                className="text-lg py-3"
            />
          </div>
      </div>
  );

  const renderStep1 = () => {
    const dbStartIndex = (dbPage - 1) * ITEMS_PER_PAGE;
    const currentDbs = databases.slice(dbStartIndex, dbStartIndex + ITEMS_PER_PAGE);
    const totalDbPages = Math.ceil(databases.length / ITEMS_PER_PAGE);

    const allTables = data.dbId ? getTables(data.dbId) : [];
    const tableStartIndex = (tablePage - 1) * ITEMS_PER_PAGE;
    const currentTables = allTables.slice(tableStartIndex, tableStartIndex + ITEMS_PER_PAGE);
    const totalTablePages = Math.ceil(allTables.length / ITEMS_PER_PAGE);

    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            {/* Database Column */}
            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                    <span>1. 选择数据库</span>
                    <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{databases.length} 个</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {currentDbs.map(db => (
                        <div 
                            key={db.id}
                            onClick={() => {
                                setData({...data, dbId: db.id, tableId: '', fieldIds: []});
                                setTablePage(1);
                            }}
                            className={cn(
                                "flex items-center p-4 rounded-lg cursor-pointer transition-all border",
                                data.dbId === db.id 
                                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-100" 
                                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-600"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0", 
                                data.dbId === db.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                            )}>
                                <Database size={20} />
                            </div>
                            <div>
                                <div className="font-medium">{db.name}</div>
                                <div className="text-xs opacity-70 uppercase mt-0.5">{db.type}</div>
                            </div>
                            {data.dbId === db.id && <CheckCircle2 size={20} className="ml-auto text-blue-600" />}
                        </div>
                    ))}
                </div>
                <div className="border-t border-slate-200 bg-slate-50">
                    <Pagination currentPage={dbPage} totalPages={totalDbPages} onPageChange={setDbPage} className="py-2" />
                </div>
            </div>

            {/* Table Column */}
            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                    <span>2. 选择数据表</span>
                    {data.dbId && <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{allTables.length} 个</span>}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {!data.dbId ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Database size={48} className="mb-4 text-slate-200" />
                            <p>请先从左侧选择一个数据库</p>
                        </div>
                    ) : (
                        currentTables.length > 0 ? currentTables.map(tbl => (
                            <div 
                                key={tbl.id}
                                onClick={() => setData({...data, tableId: tbl.id, fieldIds: []})}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border",
                                    data.tableId === tbl.id 
                                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-100" 
                                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-600"
                                )}
                            >
                                <div className="flex items-center">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0", 
                                        data.tableId === tbl.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        <TableIcon size={20} />
                                    </div>
                                    <span className="font-medium">{tbl.name}</span>
                                </div>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{tbl.rows.toLocaleString()} 行</span>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center text-slate-400">该数据库暂无数据表</div>
                        )
                    )}
                </div>
                {data.dbId && allTables.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50">
                        <Pagination currentPage={tablePage} totalPages={totalTablePages} onPageChange={setTablePage} className="py-2" />
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderStep2 = () => {
    const fields = data.tableId ? getFields(data.tableId) : [];
    const isAllSelected = fields.length > 0 && data.fieldIds.length === fields.length;

    const toggleField = (id: string) => {
        const newIds = data.fieldIds.includes(id) ? data.fieldIds.filter(f => f !== id) : [...data.fieldIds, id];
        setData({...data, fieldIds: newIds});
    };

    const toggleAll = () => setData({...data, fieldIds: isAllSelected ? [] : fields.map(f => f.id)});

    return (
      <div className="h-full flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <span className="font-semibold text-slate-700">勾选需要向量化的字段 ({data.fieldIds.length})</span>
                <button onClick={toggleAll} className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                    {isAllSelected ? '取消全选' : '全选所有字段'}
                </button>
           </div>
           <div className="flex-1 overflow-y-auto p-0">
               <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100 sticky top-0 backdrop-blur-sm">
                       <tr>
                           <th className="px-6 py-3 w-16">选择</th>
                           <th className="px-6 py-3">字段名称</th>
                           <th className="px-6 py-3">数据类型</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {fields.map((field) => (
                           <tr 
                                key={field.id} 
                                onClick={() => toggleField(field.id)}
                                className={cn("hover:bg-slate-50 transition-colors cursor-pointer", data.fieldIds.includes(field.id) && "bg-blue-50/30")}
                           >
                               <td className="px-6 py-4">
                                   <input 
                                      type="checkbox" 
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                                      checked={data.fieldIds.includes(field.id)}
                                      onChange={() => toggleField(field.id)}
                                   />
                               </td>
                               <td className="px-6 py-4 font-medium text-slate-700">{field.name}</td>
                               <td className="px-6 py-4 text-slate-500 font-mono text-xs bg-slate-100/50 rounded w-fit px-2 py-1 mx-6">{field.type}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
      </div>
    );
  };

  const renderStep3 = () => (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
          {processStatus === 'idle' && (
              <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="max-w-lg w-full">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 ring-8 ring-blue-50/50">
                      <Database size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{data.title}</h3>
                  <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100 space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">来源数据库:</span> <span className="font-medium text-slate-800">{databases.find(d => d.id === data.dbId)?.name}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">来源数据表:</span> <span className="font-medium text-slate-800">{getTables(data.dbId!)?.find(t => t.id === data.tableId)?.name}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">包含字段数:</span> <span className="font-medium text-blue-600">{data.fieldIds.length} 个</span></div>
                  </div>
                  <Button size="lg" onClick={startVectorization} className="w-full h-12 text-lg shadow-lg shadow-blue-500/20">
                      确认并开始转换
                  </Button>
              </motion.div>
          )}
          {processStatus === 'processing' && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="w-full max-w-md">
                   <div className="mb-8"><Loader2 size={64} className="mx-auto text-blue-600 animate-spin" /></div>
                   <h3 className="text-xl font-semibold text-slate-800 mb-2">正在进行向量化处理...</h3>
                   <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                       <motion.div className="bg-blue-600 h-4 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "easeOut" }} />
                   </div>
              </motion.div>
          )}
          {processStatus === 'completed' && (
              <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}>
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 ring-8 ring-green-50/50">
                      <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">处理完成！</h3>
                  <Button size="lg" variant="secondary" onClick={handleFinish} className="w-48 border-green-200 hover:bg-green-50 text-green-700">
                      关闭
                  </Button>
              </motion.div>
          )}
      </div>
  );

  return (
    <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-hidden">
             <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full">
                    {step === 0 && renderStep0()}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer */}
        {processStatus !== 'completed' && (
            <div className="flex justify-between w-full items-center mt-6 pt-4 border-t border-slate-100">
                <div className="flex space-x-2">
                    {[0, 1, 2, 3].map(s => (
                        <div key={s} className={cn("w-2.5 h-2.5 rounded-full transition-colors", step >= s ? "bg-blue-600" : "bg-slate-200")} />
                    ))}
                    <span className="ml-2 text-sm text-slate-400">Step {step + 1}/4</span>
                </div>

                <div className="flex gap-3">
                    {step === 0 ? (
                        <Button variant="secondary" onClick={onCancel}>取消</Button>
                    ) : (
                        processStatus === 'idle' && <Button variant="secondary" onClick={() => setStep(p => p - 1)}>
                            <ArrowLeft size={16} className="mr-2" /> 上一步
                        </Button>
                    )}
                    
                    {step < 3 && (
                        <Button 
                            onClick={() => setStep(p => p + 1)}
                            disabled={
                                (step === 0 && !data.title) ||
                                (step === 1 && !data.tableId) ||
                                (step === 2 && data.fieldIds.length === 0)
                            }
                        >
                            下一步 <ArrowRight size={16} className="ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};
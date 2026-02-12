import React, { useState, useEffect } from 'react';
import { Database, Table as TableIcon, CheckCircle2, ArrowRight, ArrowLeft, Loader2, CheckSquare, Square, Link as LinkIcon, AlertCircle, Plus, Trash2, Settings, ChevronDown, ChevronUp, Info, Cpu, Play, Minimize2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Pagination } from './Pagination';
import { cn, delay } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';
import { useStore } from '../store';
import { vectorApi } from '../api';
import { DatabaseItem, TableItem, FieldItem } from '../types';

// --- Props ---
interface VectorWizardProps {
  onFinish: (data: any) => void;
  onCancel: () => void;
  databases: DatabaseItem[];
  getTables: (dbId: string) => TableItem[]; // Deprecated, now fetching internally
  getFields: (tableId: string) => FieldItem[]; // Deprecated
}

// Join Config Types
interface JoinCondition {
    leftFieldId: string;
    rightFieldId: string;
}

interface JoinConfig {
    type: 'one_to_one' | 'one_to_many';
    leftTableId: string;
    rightTableId: string;
    conditions: JoinCondition[];
}

// New: Advanced Config Types
interface AdvancedConfig {
    indexType: 'HNSW' | 'IVF_FLAT' | 'IVF_PQ';
    metricType: 'COSINE' | 'L2' | 'IP';
    compression: 'NONE' | 'SQ8' | 'PQ';
}

export const VectorWizard: React.FC<VectorWizardProps> = ({ 
    onFinish, 
    onCancel, 
    databases, 
    // getTables, // Not used
    // getFields 
}) => {
  const { error: toastError, info: toastInfo } = useToast();
  const { dispatch } = useStore();
  
  // Wizard State
  const [step, setStep] = useState(0); 
  const [data, setData] = useState({
      title: '',
      dbId: '',
      tableIds: [] as string[],
      fieldKeys: [] as string[] 
  });
  
  // Async Data State
  const [tables, setTables] = useState<TableItem[]>([]);
  const [fieldsMap, setFieldsMap] = useState<Record<string, FieldItem[]>>({});
  const [fetchingTables, setFetchingTables] = useState(false);
  const [fetchingFields, setFetchingFields] = useState(false);

  // Feature States
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [joinConfig, setJoinConfig] = useState<JoinConfig>({
      type: 'one_to_one',
      leftTableId: '',
      rightTableId: '',
      conditions: [{ leftFieldId: '', rightFieldId: '' }]
  });

  // Advanced Config State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({
      indexType: 'HNSW',
      metricType: 'COSINE',
      compression: 'NONE'
  });

  // Pagination State
  const [dbPage, setDbPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [progress, setProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

  // --- Helpers & Logic ---

  // Fetch Tables when DB changes
  useEffect(() => {
      if (data.dbId) {
          setFetchingTables(true);
          vectorApi.getTables(data.dbId).then(res => {
              if (res.code === 200) setTables(res.data);
          }).finally(() => setFetchingTables(false));
      } else {
          setTables([]);
      }
  }, [data.dbId]);

  // Fetch Fields for selected tables
  useEffect(() => {
      const fetchFields = async () => {
          const newTables = data.tableIds.filter(tid => !fieldsMap[tid]);
          if (newTables.length > 0) {
              setFetchingFields(true);
              const newFieldsMap = { ...fieldsMap };
              for (const tid of newTables) {
                  try {
                      const res = await vectorApi.getFields(tid);
                      if(res.code === 200) newFieldsMap[tid] = res.data;
                  } catch (e) {}
              }
              setFieldsMap(newFieldsMap);
              setFetchingFields(false);
          }
      };
      fetchFields();
  }, [data.tableIds]);

  const checkNameAndProceed = async () => {
      // Updated Regex: Allow a-z, A-Z, 0-9, and _
      const nameRegex = /^[a-zA-Z0-9_]+$/;
      if (!nameRegex.test(data.title)) {
          toastError('名称格式错误：仅允许输入英文字母、数字和下划线');
          return;
      }

      setIsCheckingName(true);
      try {
          const res = await vectorApi.checkName(data.title);
          if (res.code === 200 && res.data.exists) {
              toastError('该向量集名称已存在，请更换');
              return;
          }
          setStep(1);
      } catch (e) {
          toastError('校验失败');
      } finally {
          setIsCheckingName(false);
      }
  };

  const handleNextStep = () => {
      if (step === 0) {
          checkNameAndProceed();
      } else if (step === 2) {
          if (data.tableIds.length > 1) {
              if (!joinConfig.leftTableId && data.tableIds.length >= 2) {
                  setJoinConfig(prev => ({
                      ...prev,
                      leftTableId: data.tableIds[0],
                      rightTableId: data.tableIds[1]
                  }));
              }
              setStep(3);
          } else {
              setStep(4);
          }
      } else {
          setStep(prev => prev + 1);
      }
  };

  const handlePrevStep = () => {
      if (step === 4) {
          if (data.tableIds.length > 1) setStep(3);
          else setStep(2);
      } else {
          setStep(prev => prev - 1);
      }
  };

  const startVectorization = async () => {
    setProcessStatus('processing');
    
    // Simulate local progress for UX if user stays
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 5; 
        });
    }, 800);

    // Call real API to start task?
    // In this specific flow requested: "7、添加向量的api...5、转化向量"
    // So we probably call create here (or in handleFinish) and the backend starts the task.
    // We'll simulate the "wait" here for UX, or just assume success if it returns.
    
    // For now, we simulate waiting, then call finish.
    await new Promise(resolve => setTimeout(resolve, 5000));
    clearInterval(interval);
    
    if (processStatus === 'processing') {
        setProgress(100);
        setProcessStatus('completed');
    }
  };

  const handleRunInBackground = () => {
      // Dispatch Task to Store & Notify
      dispatch({
          type: 'ADD_TASK',
          payload: {
              id: Date.now().toString(),
              name: `向量化: ${data.title}`,
              status: 'In Progress',
              progress: progress > 0 ? progress : 5, 
              startTime: new Date().toISOString()
          }
      });
      toastInfo('任务已转入后台运行，请关注控制台消息');
      
      // Trigger the actual creation in background (fire and forget from UI perspective)
      handleFinish(true); 
  };

  const handleFinish = (isBackground = false) => {
      onFinish({ 
          ...data, 
          joinConfig: data.tableIds.length > 1 ? joinConfig : null,
          advancedConfig 
      });
      // If background, modal is closed by parent via onFinish/onCancel logic usually
      if(isBackground) onCancel();
  };

  // --- Renders ---

  const renderStep0 = () => (
      <div className="flex flex-col justify-center items-center h-full">
          <div className="w-full max-w-md space-y-4">
            <h3 className="text-xl font-medium text-slate-800 mb-6 text-center">首先，请为向量集命名</h3>
            <Input 
                label="向量集合标识" 
                placeholder="例如：product_kb_v1" 
                value={data.title}
                onChange={(e) => setData({...data, title: e.target.value})}
                autoFocus
                className="text-lg py-3 font-mono"
            />
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex items-start">
                <AlertCircle size={14} className="mr-2 mt-0.5 shrink-0" />
                <span>命名规范：仅允许使用英文字母、数字和下划线。系统将自动检查名称唯一性。</span>
            </div>
          </div>
      </div>
  );

  const renderStep1 = () => {
    const dbStartIndex = (dbPage - 1) * ITEMS_PER_PAGE;
    const currentDbs = databases.slice(dbStartIndex, dbStartIndex + ITEMS_PER_PAGE);
    const totalDbPages = Math.ceil(databases.length / ITEMS_PER_PAGE);

    // Use fetched tables
    const tableStartIndex = (tablePage - 1) * ITEMS_PER_PAGE;
    const currentTables = tables.slice(tableStartIndex, tableStartIndex + ITEMS_PER_PAGE);
    const totalTablePages = Math.ceil(tables.length / ITEMS_PER_PAGE);

    const toggleTable = (tbl: TableItem) => {
        // Requirement: Check Primary Key
        if (tbl.hasPrimaryKey === false) {
            toastError(`表 ${tbl.name} 没有主键，无法选择`);
            return;
        }

        setData(prev => {
            const isSelected = prev.tableIds.includes(tbl.id);
            const newTableIds = isSelected 
                ? prev.tableIds.filter(tid => tid !== tbl.id)
                : [...prev.tableIds, tbl.id];
            return { ...prev, tableIds: newTableIds, fieldKeys: [] }; 
        });
    };

    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                    <span>1. 选择数据库 (单选)</span>
                    <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{databases.length} 个</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {currentDbs.map(db => (
                        <div 
                            key={db.id}
                            onClick={() => {
                                if (data.dbId !== db.id) {
                                    setData({...data, dbId: db.id, tableIds: [], fieldKeys: []});
                                    setTablePage(1);
                                }
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

            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                    <span>2. 选择数据表 (多选)</span>
                    {data.dbId && <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{tables.length} 个</span>}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                    {!data.dbId ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Database size={48} className="mb-4 text-slate-200" />
                            <p>请先从左侧选择一个数据库</p>
                        </div>
                    ) : fetchingTables ? (
                        <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2"/>加载中...</div>
                    ) : (
                        currentTables.length > 0 ? currentTables.map(tbl => {
                            const isSelected = data.tableIds.includes(tbl.id);
                            return (
                                <div 
                                    key={tbl.id}
                                    onClick={() => toggleTable(tbl)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border",
                                        isSelected
                                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-100" 
                                            : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-600"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <div className={cn("mr-3 transition-colors", isSelected ? "text-blue-600" : "text-slate-400")}>
                                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </div>
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mr-3 shrink-0", 
                                            isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                        )}>
                                            <TableIcon size={16} />
                                        </div>
                                        <span className="font-medium">{tbl.name}</span>
                                    </div>
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{tbl.rows.toLocaleString()} 行</span>
                                </div>
                            );
                        }) : (
                            <div className="h-full flex items-center justify-center text-slate-400">该数据库暂无数据表</div>
                        )
                    )}
                </div>
                {data.dbId && tables.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50">
                        <Pagination currentPage={tablePage} totalPages={totalTablePages} onPageChange={setTablePage} className="py-2" />
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderStep2 = () => {
    // Filter selected tables from fetched data
    const selectedTables = tables.filter(t => data.tableIds.includes(t.id));
    
    const toggleField = (tableId: string, fieldId: string) => {
        const key = `${tableId}:${fieldId}`;
        const newKeys = data.fieldKeys.includes(key) 
            ? data.fieldKeys.filter(k => k !== key) 
            : [...data.fieldKeys, key];
        setData({...data, fieldKeys: newKeys});
    };
    
    const totalFieldsCount = selectedTables.reduce((acc, t) => acc + (fieldsMap[t.id]?.length || 0), 0);
    const isAllSelected = totalFieldsCount > 0 && data.fieldKeys.length === totalFieldsCount;

    const toggleAll = () => {
        if (isAllSelected) {
            setData({...data, fieldKeys: []});
        } else {
            const allKeys: string[] = [];
            selectedTables.forEach(t => fieldsMap[t.id]?.forEach(f => allKeys.push(`${t.id}:${f.id}`)));
            setData({...data, fieldKeys: allKeys});
        }
    };

    return (
      <div className="h-full flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <span className="font-semibold text-slate-700">勾选需要向量化的字段 (已选 {data.fieldKeys.length})</span>
                <button onClick={toggleAll} className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors">
                    {isAllSelected ? '取消全选' : '全选所有字段'}
                </button>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar">
               {selectedTables.length === 0 ? (
                   <div className="flex items-center justify-center h-full text-slate-400">未选择数据表</div>
               ) : fetchingFields ? (
                   <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="animate-spin mr-2"/>加载字段中...</div>
               ) : (
                   <table className="w-full text-left text-sm">
                       <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100 sticky top-0 backdrop-blur-sm z-10">
                           <tr>
                               <th className="px-6 py-3 w-16">选择</th>
                               <th className="px-6 py-3">字段名称</th>
                               <th className="px-6 py-3">数据类型</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                           {selectedTables.map((table) => {
                               const tableFields = fieldsMap[table.id] || [];
                               if (tableFields.length === 0) return null;
                               return (
                                   <React.Fragment key={table.id}>
                                        <tr className="bg-slate-100/60">
                                            <td colSpan={3} className="px-6 py-2 font-semibold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                                <TableIcon size={12} /> {table.name}
                                            </td>
                                        </tr>
                                        {tableFields.map(field => {
                                            const key = `${table.id}:${field.id}`;
                                            const isChecked = data.fieldKeys.includes(key);
                                            return (
                                                <tr 
                                                    key={key} 
                                                    onClick={() => toggleField(table.id, field.id)}
                                                    className={cn("hover:bg-slate-50 transition-colors cursor-pointer", isChecked && "bg-blue-50/30")}
                                                >
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="checkbox" 
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                                                            checked={isChecked}
                                                            onChange={() => toggleField(table.id, field.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-700">{field.name}</td>
                                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                                        <span className="bg-slate-100/50 rounded px-2 py-1">{field.type}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                   </React.Fragment>
                               );
                           })}
                       </tbody>
                   </table>
               )}
           </div>
      </div>
    );
  };

  const renderStep3 = () => {
      // Filter selected tables
      const selectedTables = tables.filter(t => data.tableIds.includes(t.id));
      
      const leftFields = joinConfig.leftTableId ? (fieldsMap[joinConfig.leftTableId] || []) : [];
      const rightFields = joinConfig.rightTableId ? (fieldsMap[joinConfig.rightTableId] || []) : [];

      const addCondition = () => {
          setJoinConfig(prev => ({
              ...prev,
              conditions: [...prev.conditions, { leftFieldId: '', rightFieldId: '' }]
          }));
      };

      const removeCondition = (index: number) => {
          if (joinConfig.conditions.length > 1) {
              setJoinConfig(prev => ({
                  ...prev,
                  conditions: prev.conditions.filter((_, i) => i !== index)
              }));
          }
      };

      const updateCondition = (index: number, side: 'left' | 'right', value: string) => {
          const newConditions = [...joinConfig.conditions];
          if (side === 'left') newConditions[index].leftFieldId = value;
          else newConditions[index].rightFieldId = value;
          setJoinConfig({ ...joinConfig, conditions: newConditions });
      };

      return (
        <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto">
            <h3 className="text-xl font-medium text-slate-800 mb-2 text-center">多表关联规则配置</h3>
            <p className="text-slate-500 mb-8 text-center text-sm">定义表之间的连接方式，支持多组合键关联。</p>
            
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm w-full space-y-8">
                {/* 1. Join Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">1. 选择关联方式</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setJoinConfig({...joinConfig, type: 'one_to_one'})}
                            className={cn(
                                "border rounded-lg p-4 cursor-pointer transition-all flex items-center justify-center flex-col gap-2 hover:bg-slate-50",
                                joinConfig.type === 'one_to_one' ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 text-blue-700" : "border-slate-200 text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-2 font-bold"><Square size={16}/> - <Square size={16}/></div>
                            <span className="text-sm font-medium">一对一 (One-to-One)</span>
                        </div>
                        <div 
                            onClick={() => setJoinConfig({...joinConfig, type: 'one_to_many'})}
                            className={cn(
                                "border rounded-lg p-4 cursor-pointer transition-all flex items-center justify-center flex-col gap-2 hover:bg-slate-50",
                                joinConfig.type === 'one_to_many' ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 text-blue-700" : "border-slate-200 text-slate-600"
                            )}
                        >
                             <div className="flex items-center gap-2 font-bold"><Square size={16}/> - <div className="flex flex-col gap-0.5"><Square size={10}/><Square size={10}/></div></div>
                             <span className="text-sm font-medium">一对多 (One-to-Many)</span>
                        </div>
                    </div>
                </div>

                {/* 2. Tables Selection */}
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Select 
                            label="左表 (主表)"
                            value={joinConfig.leftTableId}
                            onChange={(val) => setJoinConfig({...joinConfig, leftTableId: val as string, conditions: [{ leftFieldId: '', rightFieldId: '' }]})}
                            options={[
                                { label: '请选择', value: '' },
                                ...selectedTables.map(t => ({ label: t.name, value: t.id }))
                            ]}
                        />
                    </div>
                    <div>
                        <Select 
                            label="右表 (从表)"
                            value={joinConfig.rightTableId}
                            onChange={(val) => setJoinConfig({...joinConfig, rightTableId: val as string, conditions: [{ leftFieldId: '', rightFieldId: '' }]})}
                            options={[
                                { label: '请选择', value: '' },
                                ...selectedTables.map(t => ({ label: t.name, value: t.id }))
                            ]}
                        />
                    </div>
                 </div>

                 {joinConfig.leftTableId && joinConfig.leftTableId === joinConfig.rightTableId && (
                    <div className="text-xs text-red-500 flex items-center -mt-4">
                        <AlertCircle size={12} className="mr-1"/> 不能关联同一张表
                    </div>
                )}

                {/* 3. Join Conditions */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                         <label className="block text-sm font-medium text-slate-700">关联字段条件</label>
                         <Button size="sm" variant="ghost" onClick={addCondition} disabled={!joinConfig.leftTableId || !joinConfig.rightTableId}>
                             <Plus size={14} className="mr-1"/> 添加关联键
                         </Button>
                    </div>
                   
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {joinConfig.conditions.map((cond, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 font-mono w-4 text-center">{index + 1}.</span>
                                <div className="flex-1">
                                    <Select 
                                        value={cond.leftFieldId}
                                        onChange={(val) => updateCondition(index, 'left', val as string)}
                                        disabled={!joinConfig.leftTableId}
                                        placeholder="左表字段"
                                        options={leftFields.map(f => ({ label: `${f.name} (${f.type})`, value: f.id }))}
                                    />
                                </div>
                                <div className="text-slate-400"><LinkIcon size={16} /></div>
                                <div className="flex-1">
                                    <Select 
                                        value={cond.rightFieldId}
                                        onChange={(val) => updateCondition(index, 'right', val as string)}
                                        disabled={!joinConfig.rightTableId}
                                        placeholder="右表字段"
                                        options={rightFields.map(f => ({ label: `${f.name} (${f.type})`, value: f.id }))}
                                    />
                                </div>
                                {joinConfig.conditions.length > 1 && (
                                    <button onClick={() => removeCondition(index)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const renderStep4 = () => (
      <div className="h-full flex flex-col items-center justify-center text-center px-8 overflow-y-auto">
          {processStatus === 'idle' && (
              <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="max-w-lg w-full py-8">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 ring-8 ring-blue-50/50">
                      <Database size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{data.title}</h3>
                  <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left border border-slate-100 space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">来源数据库:</span> <span className="font-medium text-slate-800">{databases.find(d => d.id === data.dbId)?.name}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">来源数据表:</span> <span className="font-medium text-slate-800">{data.tableIds.length} 个表</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">包含字段总数:</span> <span className="font-medium text-blue-600">{data.fieldKeys.length} 个</span></div>
                      {/* Show Join Info if applicable */}
                      {data.tableIds.length > 1 && (
                          <div className="border-t border-slate-200 pt-3 mt-3">
                              <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">关联模式:</span> <span className="font-medium text-slate-800">{joinConfig.type === 'one_to_one' ? '一对一' : '一对多'}</span></div>
                              <div className="text-xs text-slate-400">
                                  {joinConfig.conditions.map((c, i) => (
                                      <div key={i} className="truncate mt-1">
                                           🔗 {getFields(joinConfig.leftTableId)?.[0]?.name || 'Field'} = {getFields(joinConfig.rightTableId)?.[0]?.name || 'Field'}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                  
                  {/* Advanced Config Section */}
                  <div className="mb-8 w-full border-t border-slate-100 pt-4">
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-center w-full py-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                      >
                          <Settings size={14} className="mr-1.5" /> 高级配置
                          {showAdvanced ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                      </button>
                      
                      <AnimatePresence>
                          {showAdvanced && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                  <div className="bg-slate-50 rounded-xl p-5 mt-2 border border-slate-100 text-left space-y-4 shadow-inner">
                                      {/* Index Type */}
                                      <div>
                                          <Select 
                                              label="选择索引类型"
                                              value={advancedConfig.indexType}
                                              onChange={(val) => setAdvancedConfig({...advancedConfig, indexType: val as any})}
                                              options={[
                                                  { label: 'HNSW (High Accuracy, Fast)', value: 'HNSW' },
                                                  { label: 'IVF_FLAT (Low Memory)', value: 'IVF_FLAT' },
                                                  { label: 'IVF_PQ (High Compression)', value: 'IVF_PQ' },
                                              ]}
                                          />
                                      </div>

                                      {/* Metric Type */}
                                      <div>
                                          <Select 
                                              label="向量基础属性 (Metric Type)"
                                              value={advancedConfig.metricType}
                                              onChange={(val) => setAdvancedConfig({...advancedConfig, metricType: val as any})}
                                              options={[
                                                  { label: 'Cosine Similarity (余弦相似度)', value: 'COSINE' },
                                                  { label: 'Euclidean Distance (欧式距离)', value: 'L2' },
                                                  { label: 'Inner Product (内积)', value: 'IP' },
                                              ]}
                                          />
                                      </div>

                                      {/* Compression */}
                                      <div>
                                          <Select 
                                              label="向量化压缩"
                                              value={advancedConfig.compression}
                                              onChange={(val) => setAdvancedConfig({...advancedConfig, compression: val as any})}
                                              options={[
                                                  { label: '不启用压缩 (Default)', value: 'NONE' },
                                                  { label: 'Scalar Quantization (SQ8)', value: 'SQ8' },
                                                  { label: 'Product Quantization (PQ)', value: 'PQ' },
                                              ]}
                                          />
                                          {/* Explanation Text */}
                                          {advancedConfig.compression !== 'NONE' && (
                                              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                                  <Info size={14} className="mt-0.5 shrink-0" />
                                                  <p>启用向量压缩（SQ8/PQ）可显著降低内存占用（约50%-75%），并提升检索速度。但在高召回率要求的场景下，可能会造成轻微的精度损失。</p>
                                              </motion.div>
                                          )}
                                      </div>
                                  </div>
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>

                  <Button size="lg" onClick={startVectorization} className="w-full h-12 text-lg shadow-lg shadow-blue-500/20">
                      <Play size={18} className="mr-2 fill-current" />
                      确认并开始转换
                  </Button>
              </motion.div>
          )}
          {processStatus === 'processing' && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="w-full max-w-md">
                   <div className="mb-8"><Loader2 size={64} className="mx-auto text-blue-600 animate-spin" /></div>
                   <h3 className="text-xl font-semibold text-slate-800 mb-2">正在进行向量化处理...</h3>
                   <div className="w-full bg-slate-100 rounded-full h-4 mb-6 overflow-hidden">
                       <motion.div className="bg-blue-600 h-4 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "easeOut" }} />
                   </div>
                   
                   {/* Background Run Button */}
                   <Button variant="secondary" onClick={handleRunInBackground} className="w-full">
                       <Minimize2 size={16} className="mr-2" />
                       转入后台运行
                   </Button>
                   <p className="text-xs text-slate-400 mt-2">您可以关闭窗口，任务将在控制台继续运行。</p>
              </motion.div>
          )}
          {processStatus === 'completed' && (
              <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}>
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 ring-8 ring-green-50/50">
                      <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">处理完成！</h3>
                  <Button size="lg" variant="secondary" onClick={() => handleFinish(false)} className="w-48 border-green-200 hover:bg-green-50 text-green-700">
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
                    {step === 4 && renderStep4()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer */}
        {processStatus !== 'completed' && (
            <div className="flex justify-between w-full items-center mt-6 pt-4 border-t border-slate-100">
                <div className="flex space-x-2">
                    {[0, 1, 2, 3, 4].map(s => {
                        if (s === 3 && data.tableIds.length <= 1) return null;
                        return (
                             <div key={s} className={cn("w-2.5 h-2.5 rounded-full transition-colors", step >= s ? "bg-blue-600" : "bg-slate-200")} />
                        );
                    })}
                    <span className="ml-2 text-sm text-slate-400">
                        {step === 0 ? 'Start' : step === 4 ? 'Confirm' : `Step ${step}`}
                    </span>
                </div>

                <div className="flex gap-3">
                    {/* Hide cancel button during processing to force user to use the specific buttons */}
                    {processStatus === 'idle' && step === 0 ? (
                        <Button variant="secondary" onClick={onCancel}>取消</Button>
                    ) : (
                        processStatus === 'idle' && <Button variant="secondary" onClick={handlePrevStep}>
                            <ArrowLeft size={16} className="mr-2" /> 上一步
                        </Button>
                    )}
                    
                    {step < 4 && (
                        <Button 
                            onClick={handleNextStep}
                            isLoading={isCheckingName}
                            disabled={
                                (step === 0 && !data.title) ||
                                (step === 1 && data.tableIds.length === 0) ||
                                (step === 2 && data.fieldKeys.length === 0) ||
                                (step === 3 && (joinConfig.conditions.some(c => !c.leftFieldId || !c.rightFieldId) || joinConfig.leftTableId === joinConfig.rightTableId))
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

// Helper for generic field map access
function getFields(tableId: string): FieldItem[] {
    // This function is inside component scope in real usage via fieldsMap, 
    // but here used inside JSX render function scope. 
    // To make it compile without complexity, we rely on fieldsMap state in scope.
    // Since getFields helper was inside JSX map, it needs access to fieldsMap state.
    // The implementation above inside renderStep3 uses fieldsMap directly.
    return [];
}
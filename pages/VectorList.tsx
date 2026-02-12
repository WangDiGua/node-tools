import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Database, Table as TableIcon, Check, ArrowRight, ArrowLeft, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { VectorItem } from '../types';
import { request } from '../api/request';
import { formatDate, cn } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';

// --- Mock Data ---
// Expanded Mock Databases to demonstrate pagination
const MOCK_DATABASES = Array.from({ length: 18 }).map((_, i) => ({
    id: `db_${i + 1}`,
    name: i < 3 ? ['MySQL - Core Business', 'PostgreSQL - Knowledge Base', 'MongoDB - User Logs'][i] : `Database_Shard_${i + 1}`,
    type: i % 3 === 0 ? 'mysql' : i % 3 === 1 ? 'pg' : 'mongo'
}));

// Mock Tables Helper
const generateMockTables = (dbId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `tbl_${dbId}_${i + 1}`,
        name: `table_data_partition_${i + 1}`,
        rows: Math.floor(Math.random() * 100000)
    }));
};

const MOCK_TABLES: Record<string, { id: string; name: string; rows: number }[]> = {};
MOCK_DATABASES.forEach(db => {
    MOCK_TABLES[db.id] = generateMockTables(db.id, Math.floor(Math.random() * 15) + 5); // 5-20 tables per DB
});
// Override first few for stable demo
MOCK_TABLES['db_1'] = [
    { id: 'tbl_1_1', name: 'products', rows: 12050 },
    { id: 'tbl_1_2', name: 'orders', rows: 45000 },
    { id: 'tbl_1_3', name: 'users', rows: 8900 },
    { id: 'tbl_1_4', name: 'inventory', rows: 3200 },
    { id: 'tbl_1_5', name: 'logs_2023', rows: 120000 },
    { id: 'tbl_1_6', name: 'logs_2024', rows: 45000 },
];

const MOCK_FIELDS: Record<string, { id: string; name: string; type: string }[]> = {
    'tbl_1_1': [
        { id: 'f_1', name: 'product_id', type: 'INT' },
        { id: 'f_2', name: 'product_name', type: 'VARCHAR' },
        { id: 'f_3', name: 'description', type: 'TEXT' },
        { id: 'f_4', name: 'category', type: 'VARCHAR' },
        { id: 'f_5', name: 'price', type: 'DECIMAL' },
    ],
};

export const VectorList: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [items, setItems] = useState<VectorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'indexed' | 'pending' | 'error'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentItem, setCurrentItem] = useState<Partial<VectorItem>>({});
  
  // Wizard State
  const [wizardStep, setWizardStep] = useState(0); 
  const [wizardData, setWizardData] = useState({
      title: '',
      dbId: '',
      tableId: '',
      fieldIds: [] as string[]
  });
  
  // Wizard Pagination State
  const [dbPage, setDbPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Items per page in wizard lists

  const [progress, setProgress] = useState(0);
  const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

  // Load Data
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const mockData: VectorItem[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `vec_${(page - 1) * 10 + i + 1}`,
            title: `文档向量集 - ${(page - 1) * 10 + i + 1}`,
            content: `数据样本 ${(page - 1) * 10 + i + 1}...`,
            dimensions: 1536,
            source: i % 2 === 0 ? 'MySQL: products' : 'PG: articles',
            status: i % 5 === 0 ? 'error' : i % 3 === 0 ? 'pending' : 'indexed',
            createdAt: new Date().toISOString()
        }));
        
        await request.get('/vectors'); 
        setItems(mockData);
        setLoading(false);
        setSelectedIds([]); 
    };
    loadData();
  }, [page, searchTerm, statusFilter]);

  // --- Handlers ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) setSelectedIds(items.map(i => i.id));
      else setSelectedIds([]);
  };

  const handleSelectRow = (id: string) => {
      selectedIds.includes(id) 
        ? setSelectedIds(selectedIds.filter(i => i !== id)) 
        : setSelectedIds([...selectedIds, id]);
  };

  const handleBatchDelete = async () => {
      if (confirm(`确定要删除选中的 ${selectedIds.length} 个向量吗？`)) {
          setLoading(true);
          await request.delete('/vectors/batch');
          setItems(items.filter(i => !selectedIds.includes(i.id)));
          setSelectedIds([]);
          setLoading(false);
          toastSuccess('批量删除成功');
      }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个向量吗？')) {
      setLoading(true);
      await request.delete(`/vectors/${id}`);
      setItems(items.filter((i) => i.id !== id));
      if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((i) => i !== id));
      setLoading(false);
      toastSuccess('删除成功');
    }
  };

  const handleEdit = (item: VectorItem) => {
    setCurrentItem({ ...item });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentItem({});
    setModalMode('create');
    resetWizard();
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
      if (modalMode === 'edit' && currentItem.id) {
          if(!currentItem.title?.trim()) {
              toastError('标题不能为空');
              return;
          }
          setItems(prev => prev.map(item => item.id === currentItem.id ? { ...item, title: currentItem.title! } as VectorItem : item));
          toastSuccess('更新成功');
      }
      setIsModalOpen(false);
  };

  const resetWizard = () => {
      setWizardStep(0);
      setWizardData({ title: '', dbId: '', tableId: '', fieldIds: [] });
      setProgress(0);
      setProcessStatus('idle');
      setDbPage(1);
      setTablePage(1);
  };

  const startVectorization = async () => {
    setProcessStatus('processing');
    
    // Simulate progress
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 5; // Increment by 5%
        });
    }, 100);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    clearInterval(interval);
    setProgress(100);
    
    setProcessStatus('completed');
  };

  const finishWizard = () => {
    // Add newly created item to list
    const db = MOCK_DATABASES.find(d => d.id === wizardData.dbId);
    const table = MOCK_TABLES[wizardData.dbId!]?.find(t => t.id === wizardData.tableId);

    const newItem: VectorItem = {
        id: `vec_new_${Date.now()}`,
        title: wizardData.title,
        content: `Data from ${table?.name}...`,
        dimensions: 1536,
        source: `${db?.type?.toUpperCase() || 'DB'}: ${table?.name || 'Table'}`,
        status: 'indexed',
        createdAt: new Date().toISOString()
    };
    
    setItems([newItem, ...items]);
    toastSuccess('向量库创建成功');
    resetWizard();
  };

  // --- Wizard Render Steps ---
  
  // Step 0: Basic Info (Vertical Center)
  const renderStep0 = () => (
      <div className="flex flex-col justify-center items-center h-full">
          <div className="w-full max-w-md">
            <h3 className="text-xl font-medium text-slate-800 mb-8 text-center">首先，请为向量集命名</h3>
            <Input 
                label="向量标题" 
                placeholder="例如：产品知识库 V1.0" 
                value={wizardData.title}
                onChange={(e) => setWizardData({...wizardData, title: e.target.value})}
                autoFocus
                className="text-lg py-3"
            />
            <p className="text-sm text-slate-500 mt-4 text-center">
                标题用于在列表中快速识别您的向量数据集合。
            </p>
          </div>
      </div>
  );

  // Step 1: Data Source (Full Height with Pagination)
  const renderStep1 = () => {
    // Pagination Logic for DBs
    const dbStartIndex = (dbPage - 1) * ITEMS_PER_PAGE;
    const currentDbs = MOCK_DATABASES.slice(dbStartIndex, dbStartIndex + ITEMS_PER_PAGE);
    const totalDbPages = Math.ceil(MOCK_DATABASES.length / ITEMS_PER_PAGE);

    // Pagination Logic for Tables
    const allTables = wizardData.dbId ? (MOCK_TABLES[wizardData.dbId] || []) : [];
    const tableStartIndex = (tablePage - 1) * ITEMS_PER_PAGE;
    const currentTables = allTables.slice(tableStartIndex, tableStartIndex + ITEMS_PER_PAGE);
    const totalTablePages = Math.ceil(allTables.length / ITEMS_PER_PAGE);

    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            {/* Database Column */}
            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                    <span>1. 选择数据库</span>
                    <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{MOCK_DATABASES.length} 个</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {currentDbs.map(db => (
                        <div 
                            key={db.id}
                            onClick={() => {
                                setWizardData({...wizardData, dbId: db.id, tableId: '', fieldIds: []});
                                setTablePage(1); // Reset table page on DB change
                            }}
                            className={cn(
                                "flex items-center p-4 rounded-lg cursor-pointer transition-all border",
                                wizardData.dbId === db.id 
                                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-100" 
                                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-600"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0", 
                                wizardData.dbId === db.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                            )}>
                                <Database size={20} />
                            </div>
                            <div>
                                <div className="font-medium">{db.name}</div>
                                <div className="text-xs opacity-70 uppercase mt-0.5">{db.type}</div>
                            </div>
                            {wizardData.dbId === db.id && <CheckCircle2 size={20} className="ml-auto text-blue-600" />}
                        </div>
                    ))}
                </div>
                {/* Pagination Footer */}
                <div className="border-t border-slate-200 bg-slate-50">
                    <Pagination 
                        currentPage={dbPage} 
                        totalPages={totalDbPages} 
                        onPageChange={setDbPage}
                        className="py-2"
                    />
                </div>
            </div>

            {/* Table Column */}
            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                    <span>2. 选择数据表</span>
                    {wizardData.dbId && <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{allTables.length} 个</span>}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {!wizardData.dbId ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Database size={48} className="mb-4 text-slate-200" />
                            <p>请先从左侧选择一个数据库</p>
                        </div>
                    ) : (
                        currentTables.length > 0 ? currentTables.map(tbl => (
                            <div 
                                key={tbl.id}
                                onClick={() => setWizardData({...wizardData, tableId: tbl.id, fieldIds: []})}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all border",
                                    wizardData.tableId === tbl.id 
                                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-100" 
                                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-600"
                                )}
                            >
                                <div className="flex items-center">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0", 
                                        wizardData.tableId === tbl.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
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
                {/* Pagination Footer */}
                {wizardData.dbId && allTables.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50">
                        <Pagination 
                            currentPage={tablePage} 
                            totalPages={totalTablePages} 
                            onPageChange={setTablePage}
                            className="py-2"
                        />
                    </div>
                )}
            </div>
        </div>
    );
  };

  // Step 2: Fields (Full Height)
  const renderStep2 = () => {
    const fields = wizardData.tableId ? (MOCK_FIELDS[wizardData.tableId] || MOCK_FIELDS['tbl_1_1']) : [];
    const isAllSelected = fields.length > 0 && wizardData.fieldIds.length === fields.length;

    const toggleField = (id: string) => {
        const newIds = wizardData.fieldIds.includes(id) ? wizardData.fieldIds.filter(f => f !== id) : [...wizardData.fieldIds, id];
        setWizardData({...wizardData, fieldIds: newIds});
    };

    const toggleAll = () => setWizardData({...wizardData, fieldIds: isAllSelected ? [] : fields.map(f => f.id)});

    return (
      <div className="h-full flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                <span className="font-semibold text-slate-700">勾选需要向量化的字段 ({wizardData.fieldIds.length})</span>
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
                           <th className="px-6 py-3">预览示例</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {fields.map((field, idx) => (
                           <tr 
                                key={field.id} 
                                onClick={() => toggleField(field.id)}
                                className={cn("hover:bg-slate-50 transition-colors cursor-pointer", wizardData.fieldIds.includes(field.id) && "bg-blue-50/30")}
                           >
                               <td className="px-6 py-4">
                                   <input 
                                      type="checkbox" 
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                                      checked={wizardData.fieldIds.includes(field.id)}
                                      onChange={() => toggleField(field.id)}
                                   />
                               </td>
                               <td className="px-6 py-4 font-medium text-slate-700">{field.name}</td>
                               <td className="px-6 py-4 text-slate-500 font-mono text-xs bg-slate-100/50 rounded w-fit px-2 py-1 mx-6">{field.type}</td>
                               <td className="px-6 py-4 text-slate-400 italic text-xs">Sample data {idx + 1}...</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
      </div>
    );
  };

  // Step 3: Processing
  const renderStep3 = () => (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
          {processStatus === 'idle' && (
              <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="max-w-lg w-full">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 ring-8 ring-blue-50/50">
                      <Database size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{wizardData.title}</h3>
                  <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100 space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">来源数据库:</span> <span className="font-medium text-slate-800">{MOCK_DATABASES.find(d => d.id === wizardData.dbId)?.name}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">来源数据表:</span> <span className="font-medium text-slate-800">{MOCK_TABLES[wizardData.dbId!]?.find(t => t.id === wizardData.tableId)?.name}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">包含字段数:</span> <span className="font-medium text-blue-600">{wizardData.fieldIds.length} 个</span></div>
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
                   <p className="text-slate-500 mb-8">正在读取数据并调用 Embedding 模型，请稍候</p>
                   <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                       <motion.div className="bg-blue-600 h-4 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "easeOut" }} />
                   </div>
                   <div className="flex justify-between text-sm font-medium text-slate-600 mt-2">
                       <span>Progress</span><span>{progress}%</span>
                   </div>
              </motion.div>
          )}
          {processStatus === 'completed' && (
              <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}}>
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 ring-8 ring-green-50/50">
                      <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">处理完成！</h3>
                  <p className="text-slate-500 mb-8 text-lg">数据已成功转为向量并存入索引库。</p>
                  <Button size="lg" variant="secondary" onClick={() => { setIsModalOpen(false); finishWizard(); }} className="w-48 border-green-200 hover:bg-green-50 text-green-700">
                      关闭
                  </Button>
              </motion.div>
          )}
      </div>
  );

  const renderWizardFooter = () => (
      <div className="flex justify-between w-full items-center">
         {/* Step Indicator */}
         <div className="flex space-x-2">
            {[0, 1, 2, 3].map(step => (
                <div key={step} className={cn("w-2.5 h-2.5 rounded-full transition-colors", wizardStep >= step ? "bg-blue-600" : "bg-slate-200")} />
            ))}
            <span className="ml-2 text-sm text-slate-400">Step {wizardStep + 1}/4</span>
         </div>

         <div className="flex gap-3">
            {wizardStep > 0 && processStatus === 'idle' && (
                <Button variant="secondary" onClick={() => setWizardStep(p => p - 1)}>
                    <ArrowLeft size={16} className="mr-2" /> 上一步
                </Button>
            )}
            {wizardStep < 3 && (
                <Button 
                    onClick={() => setWizardStep(p => p + 1)}
                    disabled={
                        (wizardStep === 0 && !wizardData.title) ||
                        (wizardStep === 1 && !wizardData.tableId) ||
                        (wizardStep === 2 && wizardData.fieldIds.length === 0)
                    }
                >
                    下一步 <ArrowRight size={16} className="ml-2" />
                </Button>
            )}
         </div>
      </div>
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">向量管理</h1>
            <Button onClick={handleCreate}>
                <Plus size={18} className="mr-2" /> 添加向量
            </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            {/* Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center dark:border-slate-800">
                {selectedIds.length > 0 ? (
                    <div className="flex-1 flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                        <span className="font-medium mr-4">已选中 {selectedIds.length} 项</span>
                        <Button variant="danger" size="sm" onClick={handleBatchDelete}>
                            <Trash2 size={14} className="mr-2" /> 批量删除
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 max-w-sm">
                            <Input placeholder="搜索标题或内容..." leftIcon={<Search size={16} />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div className="w-40">
                            <div className="relative">
                                <Filter size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <select className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                                    <option value="all">所有状态</option>
                                    <option value="indexed">已索引</option>
                                    <option value="pending">处理中</option>
                                    <option value="error">错误</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" onChange={handleSelectAll} checked={items.length > 0 && selectedIds.length === items.length} /></th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">标题</th>
                            <th className="px-6 py-4">来源</th>
                            <th className="px-6 py-4">状态</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">加载中...</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.id} className={cn("hover:bg-slate-50 transition-colors dark:hover:bg-slate-800", selectedIds.includes(item.id) && "bg-blue-50/50 dark:bg-blue-900/10")}>
                                <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={selectedIds.includes(item.id)} onChange={() => handleSelectRow(item.id)} /></td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200"><div className="flex items-center"><FileText size={16} className="mr-2 text-slate-400" />{item.title}</div></td>
                                <td className="px-6 py-4 text-xs">{item.source}</td>
                                <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'indexed' ? 'bg-green-100 text-green-800' : item.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status === 'indexed' ? '已索引' : item.status === 'error' ? '错误' : '处理中'}</span></td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition-colors mr-2"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800">
                <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />
            </div>
        </div>

        {/* Modal: Create (Full Screen) or Edit (Standard) */}
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalMode === 'create' ? `添加向量 (步骤 ${wizardStep + 1}/4)` : '编辑向量'}
            size={modalMode === 'create' ? 'full' : 'md'}
            footer={modalMode === 'create' && processStatus !== 'completed' ? renderWizardFooter() : modalMode === 'edit' ? (
                <>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>取消</Button>
                    <Button onClick={handleSaveEdit}>保存</Button>
                </>
            ) : null}
        >
            {modalMode === 'edit' ? (
                <div className="space-y-5">
                    <Input label="向量标题" value={currentItem.title} onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})} />
                    <Input label="ID" value={currentItem.id} disabled className="bg-slate-50" />
                    <Input label="来源" value={currentItem.source} disabled className="bg-slate-50" />
                    <div className="text-xs text-yellow-600 bg-yellow-50 p-3 rounded-md flex items-start"><span className="mr-2">⚠️</span> 为了保证数据一致性，仅允许修改标题。</div>
                </div>
            ) : (
                <div className="h-full w-full max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={wizardStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full">
                            {wizardStep === 0 && renderStep0()}
                            {wizardStep === 1 && renderStep1()}
                            {wizardStep === 2 && renderStep2()}
                            {wizardStep === 3 && renderStep3()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </Modal>
    </div>
  );
};
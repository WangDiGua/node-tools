import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { Permission } from '../components/Permission';
import { VectorWizard, DatabaseItem, TableItem, FieldItem } from '../components/VectorWizard';
import { VectorItem } from '../types';
import { request } from '../api/request';
import { cn } from '../utils';
import { useToast } from '../components/Toast';

// --- Mock Data ---
const MOCK_DATABASES: DatabaseItem[] = Array.from({ length: 18 }).map((_, i) => ({
    id: `db_${i + 1}`,
    name: i < 3 ? ['MySQL - Core Business', 'PostgreSQL - Knowledge Base', 'MongoDB - User Logs'][i] : `Database_Shard_${i + 1}`,
    type: i % 3 === 0 ? 'mysql' : i % 3 === 1 ? 'pg' : 'mongo'
}));

const MOCK_TABLES: Record<string, TableItem[]> = {};
MOCK_DATABASES.forEach(db => {
    MOCK_TABLES[db.id] = Array.from({ length: Math.floor(Math.random() * 15) + 5 }).map((_, i) => ({
        id: `tbl_${db.id}_${i + 1}`,
        name: `table_data_partition_${i + 1}`,
        rows: Math.floor(Math.random() * 100000)
    }));
});
// Override first few for stable demo
MOCK_TABLES['db_1'] = [
    { id: 'tbl_1_1', name: 'products', rows: 12050 },
    { id: 'tbl_1_2', name: 'orders', rows: 45000 },
    { id: 'tbl_1_3', name: 'users', rows: 8900 },
];

const MOCK_FIELDS: Record<string, FieldItem[]> = {
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

  const handleWizardFinish = (data: any) => {
      const db = MOCK_DATABASES.find(d => d.id === data.dbId);
      const table = MOCK_TABLES[data.dbId!]?.find(t => t.id === data.tableId);

      const newItem: VectorItem = {
          id: `vec_new_${Date.now()}`,
          title: data.title,
          content: `Data from ${table?.name}...`,
          dimensions: 1536,
          source: `${db?.type?.toUpperCase() || 'DB'}: ${table?.name || 'Table'}`,
          status: 'indexed',
          createdAt: new Date().toISOString()
      };
      
      setItems([newItem, ...items]);
      toastSuccess('向量库创建成功');
      setIsModalOpen(false);
  };

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
                        <Permission roles={['admin', 'editor']} fallback={
                            <Button variant="danger" size="sm" disabled title="无权限操作">
                                <Trash2 size={14} className="mr-2" /> 批量删除
                            </Button>
                        }>
                            <Button variant="danger" size="sm" onClick={handleBatchDelete}>
                                <Trash2 size={14} className="mr-2" /> 批量删除
                            </Button>
                        </Permission>
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
                                    <Permission roles={['admin', 'editor']}>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                                    </Permission>
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

        {/* Modal: Create (Full Screen via Wizard) or Edit (Standard) */}
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalMode === 'create' ? `添加向量` : '编辑向量'}
            size={modalMode === 'create' ? 'full' : 'md'}
            // Wizard footer is handled inside the wizard now for step control
            footer={modalMode === 'edit' ? (
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
                   <VectorWizard 
                        onFinish={handleWizardFinish}
                        onCancel={() => setIsModalOpen(false)}
                        databases={MOCK_DATABASES}
                        getTables={(dbId) => MOCK_TABLES[dbId] || []}
                        getFields={(tableId) => MOCK_FIELDS[tableId] || MOCK_FIELDS['tbl_1_1'] || []}
                   />
                </div>
            )}
        </Modal>
    </div>
  );
};
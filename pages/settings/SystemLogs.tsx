import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, Search, Trash2, Eye, Filter, Clock, Calendar } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { SystemLog } from '../../types';
import { formatDate, cn } from '../../utils';

export const SystemLogs: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [page, setPage] = useState(1);
    
    // Mock Data (Consolidated Login and Operation logs)
    const [logs, setLogs] = useState<SystemLog[]>(Array.from({ length: 15 }).map((_, i) => ({
        id: `log_${i}`,
        type: i % 5 === 0 ? 'login' : i % 7 === 0 ? 'error' : 'operation',
        action: i % 5 === 0 ? '用户登录' : i % 7 === 0 ? '连接超时' : '更新向量索引',
        module: i % 5 === 0 ? 'Auth' : 'VectorEngine',
        user: i % 3 === 0 ? 'admin' : 'editor_1',
        ip: `192.168.1.${10 + i}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        status: i % 7 === 0 ? 'failure' : 'success',
        details: JSON.stringify({
            request_id: `req_${i}`,
            params: { vector_id: `vec_${i}`, force: true },
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            latency: '45ms'
        }, null, 2)
    })));

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'login' | 'operation' | 'error'>('all');
    
    // Detailed View Modal
    const [viewLog, setViewLog] = useState<SystemLog | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Retention Policy Modal
    const [isRetentionOpen, setIsRetentionOpen] = useState(false);
    const [retentionDays, setRetentionDays] = useState(30);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.includes(searchTerm) || log.user.includes(searchTerm) || log.module.includes(searchTerm);
        const matchesType = typeFilter === 'all' || log.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const openDetail = (log: SystemLog) => {
        setViewLog(log);
        setIsDetailOpen(true);
    };

    const deleteLog = (id: string) => {
        if(confirm('确定删除该条日志吗？')) {
            setLogs(logs.filter(l => l.id !== id));
            success('日志已删除');
        }
    };

    const handleSaveRetention = () => {
        success(`日志保留策略已更新：自动删除 ${retentionDays} 天前的日志`);
        setIsRetentionOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-1 gap-2 w-full md:w-auto">
                    <Input 
                        placeholder="搜索操作、用户或模块..." 
                        leftIcon={<Search size={16}/>} 
                        className="max-w-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="w-40">
                         <Select 
                            value={typeFilter}
                            onChange={(val) => setTypeFilter(val as any)}
                            options={[
                                { label: '所有类型', value: 'all' },
                                { label: '登录日志', value: 'login' },
                                { label: '操作日志', value: 'operation' },
                                { label: '系统异常', value: 'error' },
                            ]}
                        />
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setIsRetentionOpen(true)} title="设置日志自动删除规则">
                        <Clock size={16} className="mr-2 text-slate-500" /> 日志保留策略
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
                 <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                        <tr>
                            <th className="px-6 py-3">状态/类型</th>
                            <th className="px-6 py-3">操作行为</th>
                            <th className="px-6 py-3">操作人 / IP</th>
                            <th className="px-6 py-3">模块</th>
                            <th className="px-6 py-3">时间</th>
                            <th className="px-6 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredLogs.slice(0, 10).map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        {log.status === 'success' ? 
                                            <CheckCircle size={16} className="text-green-500" /> : 
                                            <AlertCircle size={16} className="text-red-500" />
                                        }
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded uppercase font-bold",
                                            log.type === 'login' ? "bg-blue-100 text-blue-700" :
                                            log.type === 'error' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                                        )}>
                                            {log.type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300">
                                    {log.action}
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900 dark:text-slate-200">{log.user}</span>
                                        <span className="text-xs text-slate-400 font-mono">{log.ip}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-slate-500 text-xs">
                                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded dark:bg-slate-800 dark:border-slate-700">{log.module}</span>
                                </td>
                                <td className="px-6 py-3 text-slate-500 text-xs font-mono">{formatDate(log.timestamp)}</td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openDetail(log)} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="查看详情">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => deleteLog(log.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="删除日志">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-t border-slate-200 dark:border-slate-800">
                     <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
                </div>
            </div>

            {/* Log Details Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title="日志详情"
                size="lg"
                footer={<Button onClick={() => setIsDetailOpen(false)}>关闭</Button>}
            >
                {viewLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-slate-50 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                <span className="text-slate-500 block text-xs mb-1">Log ID</span>
                                <span className="font-mono">{viewLog.id}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                <span className="text-slate-500 block text-xs mb-1">Timestamp</span>
                                <span className="font-mono">{formatDate(viewLog.timestamp)}</span>
                            </div>
                             <div className="p-3 bg-slate-50 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                <span className="text-slate-500 block text-xs mb-1">User / IP</span>
                                <span>{viewLog.user} ({viewLog.ip})</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                <span className="text-slate-500 block text-xs mb-1">Module / Action</span>
                                <span>{viewLog.module} - {viewLog.action}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-slate-700 mb-2 block dark:text-slate-300">详细信息 (Payload/Stack Trace)</span>
                            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[300px]">
                                <pre>{viewLog.details}</pre>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Retention Policy Modal */}
            <Modal
                isOpen={isRetentionOpen}
                onClose={() => setIsRetentionOpen(false)}
                title="日志保留策略设置"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsRetentionOpen(false)}>取消</Button>
                        <Button onClick={handleSaveRetention}>保存设置</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-700 border border-blue-100">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <p>系统将在每日凌晨 02:00 自动执行清理任务，永久删除超过保留期限的日志数据。</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">保留期限</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[7, 30, 90, 180].map(days => (
                                <div 
                                    key={days}
                                    onClick={() => setRetentionDays(days)}
                                    className={cn(
                                        "cursor-pointer border rounded-lg p-3 text-center transition-all",
                                        retentionDays === days 
                                            ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500" 
                                            : "hover:bg-slate-50 border-slate-200"
                                    )}
                                >
                                    <span className="font-bold text-lg">{days}</span> <span className="text-xs">天</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="retention" 
                                    checked={retentionDays === 0} 
                                    onChange={() => setRetentionDays(0)}
                                 />
                                 <span className="text-sm text-slate-600 dark:text-slate-400">永久保留 (不推荐，可能占用大量存储空间)</span>
                             </label>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
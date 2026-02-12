import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Database, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '../utils';
import { motion } from 'framer-motion';

// Mock Data
const statsData = [
  { name: '周一', vectors: 4000, queries: 2400 },
  { name: '周二', vectors: 3000, queries: 1398 },
  { name: '周三', vectors: 2000, queries: 9800 },
  { name: '周四', vectors: 2780, queries: 3908 },
  { name: '周五', vectors: 1890, queries: 4800 },
  { name: '周六', vectors: 2390, queries: 3800 },
  { name: '周日', vectors: 3490, queries: 4300 },
];

const tasksData = [
    { id: 1, name: '索引更新: 维基百科数据转储', status: 'In Progress', progress: 45, time: '2分钟前' },
    { id: 2, name: '向量重平衡', status: 'Pending', progress: 0, time: '1小时前' },
    { id: 3, name: '每日数据备份', status: 'Completed', progress: 100, time: '5小时前' },
    { id: 4, name: '模型同步任务', status: 'Failed', progress: 88, time: '1天前' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'console'>('stats');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          )}
        >
          统计数据
        </button>
        <button
          onClick={() => setActiveTab('console')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === 'console' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          )}
        >
          控制台 & 任务
        </button>
      </div>

      {activeTab === 'stats' && (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="向量总数" value="1,293,302" icon={<Database className="text-blue-500" />} trend="+12.5%" />
                <StatCard title="每日查询" value="45,231" icon={<Activity className="text-purple-500" />} trend="+4.3%" />
                <StatCard title="活跃节点" value="24" icon={<CheckCircle className="text-green-500" />} trend="稳定" />
                <StatCard title="索引错误" value="3" icon={<AlertTriangle className="text-red-500" />} trend="-2" isNegative />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">向量入库趋势</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="vectors" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">查询延迟 (ms)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={statsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="queries" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 0}} activeDot={{r: 6}} animationDuration={1500} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </motion.div>
      )}

      {activeTab === 'console' && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">系统任务控制台</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded animate-pulse">实时更新中</span>
            </div>
            <div className="divide-y divide-slate-100">
                {tasksData.map((task, index) => (
                    <div key={task.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center mb-1">
                                <h4 className="font-medium text-slate-900 mr-3">{task.name}</h4>
                                <StatusBadge status={task.status} />
                            </div>
                            <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mt-2">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${task.progress}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className={cn("h-2 rounded-full", 
                                        task.status === 'Completed' ? 'bg-green-500' : 
                                        task.status === 'Failed' ? 'bg-red-500' : 'bg-blue-500'
                                    )}
                                ></motion.div>
                            </div>
                        </div>
                        <div className="text-sm text-slate-400 font-mono ml-4 whitespace-nowrap">
                            {task.time}
                        </div>
                    </div>
                ))}
            </div>
            
             {/* Fake Console Logs */}
             <div className="bg-slate-900 p-4 text-xs font-mono text-slate-300 h-64 overflow-y-auto mt-0 custom-scrollbar">
                <div className="text-green-400 mb-1">$ systemctl status vector-engine</div>
                <div className="mb-1">[INFO] Vector engine running on port 8080</div>
                <div className="mb-1">[INFO] Connected to storage cluster (Node A, Node B)</div>
                <div className="text-yellow-400 mb-1">[WARN] High memory usage detected on shard_02 (85%)</div>
                <div className="mb-1">[INFO] Auto-scaling triggered...</div>
                <div className="mb-1">[INFO] New node provisioned successfully.</div>
                <div className="text-blue-400 mb-1 animate-pulse">_ cursor blinking...</div>
             </div>
        </motion.div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isNegative }: any) => (
    <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all cursor-default"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", isNegative ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                {trend}
            </span>
        </div>
        <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
        <div className="text-sm text-slate-500">{title}</div>
    </motion.div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'In Progress': 'bg-blue-100 text-blue-700',
        'Pending': 'bg-yellow-100 text-yellow-700',
        'Completed': 'bg-green-100 text-green-700',
        'Failed': 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
        'In Progress': '进行中',
        'Pending': '等待中',
        'Completed': '已完成',
        'Failed': '失败',
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles[status] || 'bg-gray-100 text-gray-800')}>
            {labels[status] || status}
        </span>
    );
};
import React from 'react';
import { FileText, ShieldAlert, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Search } from 'lucide-react';
import { formatDate } from '../utils';

export const LogAudit: React.FC = () => {
  // Mock Data
  const logs = Array.from({ length: 10 }).map((_, i) => ({
      id: `audit_${i}`,
      event: i % 3 === 0 ? 'Permission Denied' : 'Resource Access',
      severity: i % 3 === 0 ? 'High' : 'Low',
      user: 'system_monitor',
      ip: '192.168.1.' + (100 + i),
      timestamp: new Date().toISOString()
  }));

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">日志审计</h1>
            <p className="text-slate-500 dark:text-slate-400">查看系统操作记录与安全审计追踪。</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
             <div className="p-4 border-b border-slate-100 flex gap-4 dark:border-slate-800">
                <Input placeholder="搜索日志内容..." leftIcon={<Search size={16} />} className="max-w-md dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                <Button variant="secondary" className="dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">导出日志</Button>
             </div>
             
             <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4">事件类型</th>
                        <th className="px-6 py-4">严重程度</th>
                        <th className="px-6 py-4">触发用户</th>
                        <th className="px-6 py-4">IP 地址</th>
                        <th className="px-6 py-4">时间</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="px-6 py-4 font-medium flex items-center gap-2">
                                <FileText size={16} className="text-slate-400" />
                                {log.event}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    log.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {log.severity}
                                </span>
                            </td>
                            <td className="px-6 py-4">{log.user}</td>
                            <td className="px-6 py-4 font-mono text-xs">{log.ip}</td>
                            <td className="px-6 py-4">{formatDate(log.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
};
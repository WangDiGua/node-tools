import React, { useState } from 'react';
import { AlertCircle, Search, Ban, MapPin, Activity } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate } from '../../utils';

interface IpRecord {
    id: string;
    ip: string;
    location: string;
    accessCount: number;
    lastAccess: string;
    status: 'allowed' | 'blocked';
}

export const SystemSecurity: React.FC = () => {
    const { success, error } = useToast();
    const [ips, setIps] = useState<IpRecord[]>([
        { id: '1', ip: '192.168.1.102', location: '局域网', accessCount: 1450, lastAccess: new Date().toISOString(), status: 'allowed' },
        { id: '2', ip: '202.106.0.20', location: '北京', accessCount: 45, lastAccess: new Date(Date.now() - 3600000).toISOString(), status: 'blocked' },
        { id: '3', ip: '114.247.50.2', location: '上海', accessCount: 230, lastAccess: new Date(Date.now() - 7200000).toISOString(), status: 'allowed' },
    ]);

    const toggleBlock = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'allowed' ? 'blocked' : 'allowed';
        setIps(prev => prev.map(ip => ip.id === id ? { ...ip, status: newStatus as any } : ip));
        if (newStatus === 'blocked') {
            error(`已封禁 IP: ${ips.find(i => i.id === id)?.ip}`);
        } else {
            success(`已解封 IP: ${ips.find(i => i.id === id)?.ip}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-sm text-orange-800 flex items-start dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>在此管理访问系统的 IP 白名单与黑名单。封禁操作将立即生效，被封禁的 IP 将无法访问任何系统接口。</p>
            </div>

            <div className="flex justify-between items-center">
                 <Input placeholder="搜索 IP 地址..." leftIcon={<Search size={16}/>} className="max-w-md dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                 <Button variant="danger"><Ban size={16} className="mr-2" /> 添加封禁 IP</Button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                        <tr>
                            <th className="px-6 py-4">IP 地址</th>
                            <th className="px-6 py-4">地理位置</th>
                            <th className="px-6 py-4">访问次数</th>
                            <th className="px-6 py-4">状态</th>
                            <th className="px-6 py-4">最后访问时间</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {ips.map(record => (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800">
                                <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                    {record.ip}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-slate-500">
                                        <MapPin size={14} className="mr-1" /> {record.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-slate-500">
                                        <Activity size={14} className="mr-1" /> {record.accessCount}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {record.status === 'allowed' ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                            正常
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                            已封禁
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">
                                    {formatDate(record.lastAccess)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button 
                                        size="sm" 
                                        variant={record.status === 'allowed' ? 'danger' : 'secondary'}
                                        onClick={() => toggleBlock(record.id, record.status)}
                                    >
                                        {record.status === 'allowed' ? '封禁' : '解封'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
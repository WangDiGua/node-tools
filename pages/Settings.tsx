import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Search, Plus, MoreHorizontal, Shield, User as UserIcon, AlertCircle, CheckCircle, List, Eye, EyeOff, Lock, Ban, MapPin, Activity, Edit2, Trash2, Power } from 'lucide-react';
import { User, Role, SystemLog } from '../types';
import { formatDate, cn } from '../utils';
import { useToast } from '../components/Toast';

// --- Sub-Components for Settings ---

const MenuManagement = () => {
    // Mock Menu Data structure
    const [menus, setMenus] = useState([
        { id: 1, name: '仪表盘', path: '/dashboard', visible: true, roles: ['admin', 'editor', 'viewer'] },
        { id: 2, name: '向量配置', path: '/vector-config', visible: true, roles: ['admin', 'editor'] },
        { id: 21, name: '├─ 向量管理', path: '/vector', visible: true, roles: ['admin', 'editor'] },
        { id: 22, name: '├─ 向量搜索', path: '/vector-search', visible: true, roles: ['admin', 'editor', 'viewer'] },
        { id: 3, name: '知识库', path: '/kb', visible: true, roles: ['admin', 'editor'] },
        { id: 31, name: '├─ 知识库配置', path: '/kb/config', visible: true, roles: ['admin', 'editor'] },
        { id: 32, name: '├─ 知识库检索', path: '/kb/retrieval', visible: true, roles: ['admin', 'editor', 'viewer'] },
        { id: 4, name: '节点工具', path: '/tools', visible: true, roles: ['admin', 'editor'] },
        { id: 41, name: '├─ 大模型输出清洁', path: '/tools/llm-clean', visible: true, roles: ['admin', 'editor'] },
        { id: 5, name: '系统设置', path: '/settings', visible: true, roles: ['admin'] },
        { id: 51, name: '├─ 菜单管理', path: '/settings/menus', visible: true, roles: ['admin'] },
        { id: 52, name: '├─ 角色管理', path: '/settings/roles', visible: true, roles: ['admin'] },
        { id: 53, name: '├─ 用户管理', path: '/settings/users', visible: true, roles: ['admin'] },
        { id: 54, name: '├─ 系统安全', path: '/settings/security', visible: true, roles: ['admin'] },
        { id: 55, name: '├─ 登录日志', path: '/settings/login-logs', visible: true, roles: ['admin'] },
        { id: 6, name: '日志审计', path: '/log-audit', visible: true, roles: ['admin'] },
        { id: 7, name: 'API 文档', path: 'external-docs', visible: false, roles: ['admin', 'editor'] },
    ]);

    const toggleVisibility = (id: number) => {
        setMenus(menus.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
    };

    const toggleRole = (menuId: number, role: string) => {
        setMenus(menus.map(m => {
            if (m.id !== menuId) return m;
            const newRoles = m.roles.includes(role) 
                ? m.roles.filter(r => r !== role)
                : [...m.roles, role];
            return { ...m, roles: newRoles };
        }));
    };

    const allRoles = ['admin', 'editor', 'viewer'];

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                <p>在此配置左侧导航栏的显示状态以及不同角色的访问权限。</p>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                        <tr>
                            <th className="px-6 py-4">菜单名称</th>
                            <th className="px-6 py-4">路由路径</th>
                            <th className="px-6 py-4 text-center">显示状态</th>
                            <th className="px-6 py-4">允许访问的角色</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {menus.map(menu => (
                            <tr key={menu.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800">
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                    {menu.name}
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs dark:text-slate-400">
                                    {menu.path}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => toggleVisibility(menu.id)}
                                        className={cn(
                                            "p-1.5 rounded-full transition-colors",
                                            menu.visible 
                                                ? "bg-green-100 text-green-600 hover:bg-green-200" 
                                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                        )}
                                        title={menu.visible ? "点击隐藏" : "点击显示"}
                                    >
                                        {menu.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {allRoles.map(role => (
                                            <button
                                                key={role}
                                                onClick={() => toggleRole(menu.id, role)}
                                                className={cn(
                                                    "px-2 py-1 rounded text-xs border transition-all",
                                                    menu.roles.includes(role)
                                                        ? "bg-blue-50 border-blue-200 text-blue-700 font-medium dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                                                        : "bg-transparent border-slate-200 text-slate-400 hover:border-slate-300 dark:border-slate-700"
                                                )}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const { success, error } = useToast();
    // Enhanced Mock Data & State
    const [users, setUsers] = useState<User[]>([
        { id: '1', username: 'admin', email: 'admin@vector.com', role: 'admin', status: 'active', lastLogin: new Date().toISOString() },
        { id: '2', username: 'jason_dev', email: 'jason@vector.com', role: 'editor', status: 'active', lastLogin: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', username: 'guest_01', email: 'guest@partner.com', role: 'viewer', status: 'inactive', lastLogin: new Date(Date.now() - 86400000 * 5).toISOString() },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentUser, setCurrentUser] = useState<Partial<User>>({});

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => {
        setCurrentUser({ status: 'active', role: 'viewer' });
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setCurrentUser({ ...user });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(confirm('确定要删除该用户吗？此操作不可恢复。')) {
            setUsers(prev => prev.filter(u => u.id !== id));
            success('用户已删除');
        }
    };

    const handleToggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
        success(`用户已${newStatus === 'active' ? '启用' : '停用'}`);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'create') {
            const newUser: User = {
                id: Date.now().toString(),
                username: currentUser.username || '',
                email: currentUser.email || '',
                role: currentUser.role as any || 'viewer',
                status: currentUser.status as any || 'active',
                lastLogin: new Date().toISOString()
            };
            setUsers([...users, newUser]);
            success('用户创建成功');
        } else {
            setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...currentUser } as User : u));
            success('用户信息更新成功');
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 w-full md:w-auto flex-1">
                    <Input 
                        placeholder="搜索用户名或邮箱..." 
                        leftIcon={<Search size={16}/>} 
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="relative w-40">
                        <select 
                            className="w-full h-[42px] px-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">所有状态</option>
                            <option value="active">正常</option>
                            <option value="inactive">停用</option>
                        </select>
                    </div>
                </div>
                <Button onClick={handleCreate}><Plus size={16} className="mr-2" /> 新增用户</Button>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                        <tr>
                            <th className="px-6 py-4">用户</th>
                            <th className="px-6 py-4">角色</th>
                            <th className="px-6 py-4">状态</th>
                            <th className="px-6 py-4">最后登录</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3 dark:bg-blue-900 dark:text-blue-300">
                                            {user.username.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-slate-200">{user.username}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize",
                                        user.role === 'admin' ? "bg-purple-100 text-purple-700" :
                                        user.role === 'editor' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                                    )}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.status === 'active' ? (
                                        <span className="inline-flex items-center text-green-600 text-xs dark:text-green-400">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span> 正常
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-slate-400 text-xs">
                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></span> 停用
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                    {formatDate(user.lastLogin)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleEdit(user)} 
                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="编辑"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleStatus(user.id, user.status)} 
                                            className={cn("p-1 transition-colors", user.status === 'active' ? "text-slate-400 hover:text-orange-600" : "text-green-600 hover:text-green-700")}
                                            title={user.status === 'active' ? "停用" : "启用"}
                                        >
                                            <Power size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user.id)} 
                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? '新增用户' : '编辑用户'}
            >
                <form id="userForm" onSubmit={handleSave} className="space-y-4">
                    <Input 
                        label="用户名" 
                        required 
                        value={currentUser.username || ''} 
                        onChange={e => setCurrentUser({...currentUser, username: e.target.value})}
                    />
                    <Input 
                        label="电子邮箱" 
                        type="email"
                        required 
                        value={currentUser.email || ''} 
                        onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">角色权限</label>
                        <select 
                            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-blue-500 focus:outline-none"
                            value={currentUser.role}
                            onChange={e => setCurrentUser({...currentUser, role: e.target.value as any})}
                        >
                            <option value="viewer">只读访客 (Viewer)</option>
                            <option value="editor">编辑人员 (Editor)</option>
                            <option value="admin">管理员 (Admin)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">账号状态</label>
                        <select 
                            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:border-blue-500 focus:outline-none"
                            value={currentUser.status}
                            onChange={e => setCurrentUser({...currentUser, status: e.target.value as any})}
                        >
                            <option value="active">正常</option>
                            <option value="inactive">停用</option>
                        </select>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>取消</Button>
                        <Button type="submit">保存</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const RoleManagement = () => {
    const roles: Role[] = [
        { id: '1', name: '超级管理员', description: '拥有系统所有权限', permissions: ['all'] },
        { id: '2', name: '向量编辑员', description: '可以管理向量数据的增删改查', permissions: ['vector.read', 'vector.write', 'vector.delete'] },
        { id: '3', name: '只读访客', description: '仅可查看数据，无法进行修改', permissions: ['vector.read', 'dashboard.read'] },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
                <div key={role.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-indigo-900/20 dark:text-indigo-400">
                            <Shield size={20} />
                        </div>
                        <button className="text-slate-400 hover:text-indigo-600">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 dark:text-white">{role.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 h-10 dark:text-slate-400">{role.description}</p>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-400">
                            {role.permissions.length} 个权限点
                        </span>
                        <span className="text-xs text-indigo-600 cursor-pointer hover:underline dark:text-indigo-400">配置权限 &rarr;</span>
                    </div>
                </div>
            ))}
             <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-all min-h-[200px] dark:border-slate-800">
                <Plus size={32} className="mb-2" />
                <span className="font-medium">创建新角色</span>
            </div>
        </div>
    );
};

// --- New System Security Component ---
interface IpRecord {
    id: string;
    ip: string;
    location: string;
    accessCount: number;
    lastAccess: string;
    status: 'allowed' | 'blocked';
}

const SystemSecurity = () => {
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

const LogManagement = () => {
    const logs: SystemLog[] = Array.from({ length: 8 }).map((_, i) => ({
        id: `log_${i}`,
        action: i % 2 === 0 ? 'UPDATE_VECTOR' : 'LOGIN_ATTEMPT',
        module: i % 2 === 0 ? 'VectorModule' : 'AuthModule',
        user: i % 3 === 0 ? 'admin' : 'system_bot',
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        status: i === 4 ? 'failure' : 'success'
    }));

    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                <Button variant="secondary" size="sm" className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">全部日志</Button>
                <Button variant="ghost" size="sm" className="dark:text-slate-400">仅错误</Button>
                <Button variant="ghost" size="sm" className="dark:text-slate-400">最近24小时</Button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
                 <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                        <tr>
                            <th className="px-6 py-3">状态</th>
                            <th className="px-6 py-3">操作行为</th>
                            <th className="px-6 py-3">操作人</th>
                            <th className="px-6 py-3">模块</th>
                            <th className="px-6 py-3">时间</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                <td className="px-6 py-3">
                                    {log.status === 'success' ? 
                                        <CheckCircle size={16} className="text-green-500" /> : 
                                        <AlertCircle size={16} className="text-red-500" />
                                    }
                                </td>
                                <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300">{log.action}</td>
                                <td className="px-6 py-3">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono dark:bg-slate-800 dark:text-slate-400">
                                        {log.user}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-500 text-xs">{log.module}</td>
                                <td className="px-6 py-3 text-slate-400 text-xs font-mono">{formatDate(log.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Settings Page ---

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">系统设置</h1>
            <p className="text-slate-500 dark:text-slate-400">管理菜单显示、用户访问权限及系统审计日志。</p>
        </div>
        
        <Routes>
            <Route index element={<Navigate to="menus" replace />} />
            <Route path="menus" element={<MenuManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="security" element={<SystemSecurity />} />
            <Route path="login-logs" element={<LogManagement />} />
        </Routes>
    </div>
  );
};
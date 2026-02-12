import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { User } from '../../types';
import { formatDate, cn } from '../../utils';

export const UserManagement: React.FC = () => {
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
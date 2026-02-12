import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Power } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { User } from '../../types';
import { formatDate, cn } from '../../utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Validation Schema
const userSchema = z.object({
    username: z.string().min(2, '用户名至少2个字符').max(20, '用户名过长'),
    email: z.string().email('请输入有效的邮箱地址'),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码').optional().or(z.literal('')),
    gender: z.enum(['male', 'female', 'other'], { required_error: '请选择性别' }),
    age: z.coerce.number().min(1, '年龄必须大于0').max(120, '年龄无效').optional(),
    role: z.enum(['admin', 'editor', 'viewer'], { required_error: '请选择角色' }),
    status: z.enum(['active', 'inactive'], { required_error: '请选择状态' }),
});

type UserFormInputs = z.infer<typeof userSchema>;

export const UserManagement: React.FC = () => {
    const { success } = useToast();
    // Enhanced Mock Data & State
    const [users, setUsers] = useState<User[]>([
        { id: '1', username: 'admin', email: 'admin@vector.com', phone: '13800000001', gender: 'male', age: 30, role: 'admin', status: 'active', lastLogin: new Date().toISOString() },
        { id: '2', username: 'jason_dev', email: 'jason@vector.com', phone: '13912345678', gender: 'male', age: 26, role: 'editor', status: 'active', lastLogin: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', username: 'guest_01', email: 'guest@partner.com', phone: '13587654321', gender: 'female', age: 24, role: 'viewer', status: 'inactive', lastLogin: new Date(Date.now() - 86400000 * 5).toISOString() },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentEditId, setCurrentEditId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<UserFormInputs>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            email: '',
            phone: '',
            gender: 'other',
            role: 'viewer',
            status: 'active'
        }
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreate = () => {
        reset({
            username: '',
            email: '',
            phone: '',
            gender: 'other',
            age: undefined,
            role: 'viewer',
            status: 'active'
        });
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        reset({
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            gender: user.gender || 'other',
            age: user.age,
            role: user.role,
            status: user.status
        });
        setCurrentEditId(user.id);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('确定要删除该用户吗？此操作将移除用户所有数据且不可恢复。')) {
            setUsers(prev => prev.filter(u => u.id !== id));
            success('用户已永久删除');
        }
    };

    const handleToggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
        success(`用户已${newStatus === 'active' ? '启用' : '停用'}`);
    };

    const onSubmit = (data: UserFormInputs) => {
        if (modalMode === 'create') {
            const newUser: User = {
                id: Date.now().toString(),
                ...data,
                lastLogin: new Date().toISOString(),
            };
            setUsers([...users, newUser]);
            success('用户创建成功');
        } else {
            setUsers(users.map(u => u.id === currentEditId ? { ...u, ...data } as User : u));
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
                    <div className="w-40">
                        <Select 
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val as any)}
                            options={[
                                { label: '所有状态', value: 'all' },
                                { label: '正常', value: 'active' },
                                { label: '停用', value: 'inactive' },
                            ]}
                        />
                    </div>
                </div>
                <Button onClick={handleCreate}><Plus size={16} className="mr-2" /> 新增用户</Button>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                            <tr>
                                <th className="px-6 py-4">用户</th>
                                <th className="px-6 py-4">手机号码</th>
                                <th className="px-6 py-4">性别</th>
                                <th className="px-6 py-4">年龄</th>
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
                                    <td className="px-6 py-4">{user.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}
                                    </td>
                                    <td className="px-6 py-4">{user.age || '-'}</td>
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
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                onClick={() => handleEdit(user)} 
                                                className="h-8 px-2"
                                                title="编辑"
                                            >
                                                <Edit2 size={14} className="mr-1" /> 编辑
                                            </Button>
                                            
                                            <Button 
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleToggleStatus(user.id, user.status)} 
                                                className={cn("h-8 px-2 transition-colors", user.status === 'active' ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50")}
                                                title={user.status === 'active' ? "停用" : "启用"}
                                            >
                                                <Power size={14} className="mr-1" /> {user.status === 'active' ? "停用" : "启用"}
                                            </Button>

                                            <Button 
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(user.id)} 
                                                className="h-8 px-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-none"
                                                title="删除"
                                            >
                                                <Trash2 size={14} className="mr-1" /> 删除
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? '新增用户' : '编辑用户'}
                size="md"
            >
                <form id="userForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="用户名" 
                            {...register('username')}
                            error={errors.username?.message}
                        />
                        <Input 
                            label="手机号码" 
                            {...register('phone')}
                            error={errors.phone?.message}
                        />
                    </div>
                    <Input 
                        label="电子邮箱" 
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        label="性别"
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={[
                                            { label: '男', value: 'male' },
                                            { label: '女', value: 'female' },
                                            { label: '其他', value: 'other' },
                                        ]}
                                        error={errors.gender?.message}
                                    />
                                )}
                            />
                        </div>
                        <Input 
                            label="年龄" 
                            type="number" 
                            {...register('age')}
                            error={errors.age?.message}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        label="角色权限"
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={[
                                            { label: '只读访客 (Viewer)', value: 'viewer' },
                                            { label: '编辑人员 (Editor)', value: 'editor' },
                                            { label: '管理员 (Admin)', value: 'admin' },
                                        ]}
                                        error={errors.role?.message}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        label="账号状态"
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={[
                                            { label: '正常', value: 'active' },
                                            { label: '停用', value: 'inactive' },
                                        ]}
                                        error={errors.status?.message}
                                    />
                                )}
                            />
                        </div>
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
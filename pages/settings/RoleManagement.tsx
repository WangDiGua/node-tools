import React, { useState } from 'react';
import { Shield, MoreHorizontal, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { Role } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { cn } from '../../utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Validation Schema
const roleSchema = z.object({
    name: z.string().min(2, '角色名称至少2个字符').max(20, '角色名称过长'),
    description: z.string().max(100, '描述不能超过100个字符').optional(),
});

type RoleFormInputs = z.infer<typeof roleSchema>;

export const RoleManagement: React.FC = () => {
    const { success } = useToast();
    const [roles, setRoles] = useState<Role[]>([
        { id: '1', name: '超级管理员', description: '拥有系统所有权限', permissions: ['all'] },
        { id: '2', name: '向量编辑员', description: '可以管理向量数据的增删改查', permissions: ['vector.read', 'vector.write', 'vector.delete'] },
        { id: '3', name: '只读访客', description: '仅可查看数据，无法进行修改', permissions: ['vector.read', 'dashboard.read'] },
    ]);

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);
    const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
    
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [permRole, setPermRole] = useState<Role | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RoleFormInputs>({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: '', description: '' }
    });

    // Mock Permissions List
    const availablePermissions = [
        { id: 'dashboard.read', label: '查看仪表盘' },
        { id: 'vector.read', label: '查看向量列表' },
        { id: 'vector.write', label: '新增/编辑向量' },
        { id: 'vector.delete', label: '删除向量' },
        { id: 'kb.manage', label: '知识库管理' },
        { id: 'users.manage', label: '用户管理' },
        { id: 'system.settings', label: '系统设置' },
    ];

    const handleCreate = () => {
        reset({ name: '', description: '' });
        setCurrentPermissions([]);
        setCurrentRoleId(null);
        setModalMode('create');
        setIsRoleModalOpen(true);
    };

    const handleEdit = (role: Role) => {
        reset({ name: role.name, description: role.description });
        setCurrentPermissions(role.permissions);
        setCurrentRoleId(role.id);
        setModalMode('edit');
        setIsRoleModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('确定要删除此角色吗？关联的用户可能会失去权限。')) {
            setRoles(roles.filter(r => r.id !== id));
            success('角色已删除');
        }
    };

    const onSubmit = (data: RoleFormInputs) => {
        if (modalMode === 'create') {
            const newRole: Role = {
                id: Date.now().toString(),
                name: data.name,
                description: data.description || '',
                permissions: [] // New roles start with no permissions in this flow, or reuse currentPermissions state
            };
            setRoles([...roles, newRole]);
            success('角色创建成功');
        } else {
            setRoles(roles.map(r => r.id === currentRoleId ? { ...r, ...data } as Role : r));
            success('角色更新成功');
        }
        setIsRoleModalOpen(false);
    };

    const openPermModal = (role: Role) => {
        setPermRole({ ...role }); // Clone
        setIsPermModalOpen(true);
    };

    const togglePermission = (permId: string) => {
        if (!permRole) return;
        const newPerms = permRole.permissions.includes(permId)
            ? permRole.permissions.filter(p => p !== permId)
            : [...permRole.permissions, permId];
        setPermRole({ ...permRole, permissions: newPerms });
    };

    const savePermissions = () => {
        if (permRole) {
            setRoles(roles.map(r => r.id === permRole.id ? permRole : r));
            success('权限配置已更新');
            setIsPermModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group dark:bg-slate-900 dark:border-slate-800 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-indigo-900/20 dark:text-indigo-400">
                                <Shield size={20} />
                            </div>
                            
                            {/* Actions Dropdown Trigger (Simplified as buttons for clarity) */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(role)} className="p-1 text-slate-400 hover:text-blue-600" title="编辑">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(role.id)} className="p-1 text-slate-400 hover:text-red-600" title="删除">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1 dark:text-white">{role.name}</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10 dark:text-slate-400 line-clamp-2">{role.description}</p>
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-400">
                                {role.permissions.includes('all') ? '全部权限' : `${role.permissions.length} 个权限点`}
                            </span>
                            <span 
                                onClick={() => openPermModal(role)}
                                className="text-xs text-indigo-600 cursor-pointer hover:underline dark:text-indigo-400"
                            >
                                配置权限 &rarr;
                            </span>
                        </div>
                    </div>
                ))}
                 <div 
                    onClick={handleCreate}
                    className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-all min-h-[200px] dark:border-slate-800"
                >
                    <Plus size={32} className="mb-2" />
                    <span className="font-medium">创建新角色</span>
                </div>
            </div>

            {/* Create/Edit Role Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                title={modalMode === 'create' ? '创建新角色' : '编辑角色'}
                size="sm"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input 
                        label="角色名称" 
                        {...register('name')}
                        error={errors.name?.message}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">角色描述</label>
                        <textarea 
                            className="block w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            rows={3}
                            {...register('description')}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsRoleModalOpen(false)}>取消</Button>
                        <Button type="submit">保存</Button>
                    </div>
                </form>
            </Modal>

            {/* Permission Config Modal */}
            <Modal
                isOpen={isPermModalOpen}
                onClose={() => setIsPermModalOpen(false)}
                title={`配置权限 - ${permRole?.name}`}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsPermModalOpen(false)}>取消</Button>
                        <Button onClick={savePermissions}>确认修改</Button>
                    </>
                }
            >
                <div className="grid grid-cols-2 gap-4">
                    {availablePermissions.map(perm => {
                        const isChecked = permRole?.permissions.includes(perm.id) || permRole?.permissions.includes('all');
                        return (
                            <div 
                                key={perm.id} 
                                className={cn(
                                    "p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors",
                                    isChecked 
                                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" 
                                        : "bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                                )}
                                onClick={() => togglePermission(perm.id)}
                            >
                                <span className="text-sm font-medium">{perm.label}</span>
                                {isChecked && <Check size={16} />}
                            </div>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
};
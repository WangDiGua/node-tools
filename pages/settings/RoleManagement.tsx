import React from 'react';
import { Shield, MoreHorizontal, Plus } from 'lucide-react';
import { Role } from '../../types';

export const RoleManagement: React.FC = () => {
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
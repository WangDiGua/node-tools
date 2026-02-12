import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils';

export const MenuManagement: React.FC = () => {
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
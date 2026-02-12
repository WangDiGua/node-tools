import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, Settings, Users, Shield, FileText, BookOpen, Search as SearchIcon, List, ChevronRight, ChevronDown, Lock, Book, Wrench, Eraser } from 'lucide-react';
import { cn } from '../utils';
import { APP_CONFIG } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  {
    title: '仪表盘',
    icon: <LayoutDashboard size={20} />,
    path: '/dashboard'
  },
  {
    title: '向量配置',
    icon: <Database size={20} />,
    path: '/vector-config', // Virtual parent path
    children: [
        {
            title: '向量管理',
            icon: <Database size={18} />,
            path: '/vector'
        },
        {
            title: '向量搜索',
            icon: <SearchIcon size={18} />,
            path: '/vector-search'
        },
    ]
  },
  {
    title: '知识库',
    icon: <Book size={20} />,
    path: '/kb', // Virtual parent
    children: [
        {
            title: '知识库配置',
            icon: <Settings size={18} />,
            path: '/kb/config'
        },
        {
            title: '知识库检索',
            icon: <SearchIcon size={18} />,
            path: '/kb/retrieval'
        }
    ]
  },
  {
    title: '节点工具',
    icon: <Wrench size={20} />,
    path: '/tools', // Virtual parent
    children: [
        {
            title: '大模型输出清洁',
            icon: <Eraser size={18} />,
            path: '/tools/llm-clean'
        }
    ]
  },
  {
    title: '系统设置',
    icon: <Settings size={20} />,
    path: '/settings',
    children: [
      { title: '菜单管理', path: '/settings/menus', icon: <List size={18} /> },
      { title: '角色管理', path: '/settings/roles', icon: <Shield size={18} /> },
      { title: '用户管理', path: '/settings/users', icon: <Users size={18} /> },
      { title: '系统安全', path: '/settings/security', icon: <Lock size={18} /> },
      { title: '登录日志', path: '/settings/login-logs', icon: <FileText size={18} /> },
    ]
  },
  {
    title: '日志审计',
    icon: <FileText size={20} />,
    path: '/log-audit'
  },
  {
    title: 'API 文档',
    icon: <BookOpen size={20} />,
    path: 'external-docs', // Special marker
    isExternal: true
  }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Automatically expand menu if a child is active
  useEffect(() => {
    const parent = menuItems.find(item => 
        item.children && item.children.some(child => location.pathname.startsWith(child.path))
    );
    if (parent && !expandedMenus.includes(parent.title)) {
        setExpandedMenus(prev => [...prev, parent.title]);
    }
  }, [location.pathname]);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title) 
        : [...prev, title]
    );
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(`${APP_CONFIG.API_BASE_URL}/docs`, '_blank');
  };

  return (
    <div className="w-64 flex flex-col h-full border-r shadow-xl z-20 transition-colors duration-300
      bg-white border-slate-200 text-slate-600 
      dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
      
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b transition-colors duration-300
        border-slate-100 bg-white
        dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">V</div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">VectorAdmin</span>
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div className="mb-1">
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    'w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
                    expandedMenus.includes(item.title)
                        ? 'text-slate-800 bg-slate-100 dark:text-white dark:bg-slate-800/50' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white transition-colors">{item.icon}</span>
                    {item.title}
                  </div>
                  {expandedMenus.includes(item.title) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {/* Submenu Accordion */}
                <AnimatePresence>
                    {expandedMenus.includes(item.title) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pl-9 pr-2 py-1 space-y-1">
                            {item.children.map((child) => (
                                <NavLink
                                key={child.path}
                                to={child.path}
                                className={({ isActive }) =>
                                    cn(
                                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative',
                                    isActive
                                        ? 'text-primary bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                                    )
                                }
                                >
                                {({ isActive }) => (
                                    <>
                                        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full"></span>}
                                        <span className="mr-3 opacity-80">{child.icon}</span>
                                        {child.title}
                                    </>
                                )}
                                </NavLink>
                            ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            ) : (
                item.isExternal ? (
                    <a
                        href="#"
                        onClick={handleExternalClick}
                        className={cn(
                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md mb-1 transition-all duration-200',
                            'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        )}
                    >
                         <span className="mr-3 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white transition-colors">{item.icon}</span>
                         {item.title}
                    </a>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md mb-1 transition-all duration-200',
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                      )
                    }
                  >
                     {({ isActive }) => (
                        <>
                            <span className={cn("mr-3 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white")}>{item.icon}</span>
                            {item.title}
                        </>
                     )}
                  </NavLink>
                )
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t transition-colors duration-300
        border-slate-100 bg-slate-50
        dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs text-slate-500 text-center dark:text-slate-500">
            v1.1.0 Enterprise
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { User, Mail, Shield, Calendar, MapPin, Camera } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useStore } from '../store';

export const Profile: React.FC = () => {
  const { state } = useStore();
  const user = state.user || { username: 'Guest', email: 'guest@example.com', role: 'viewer' };

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">个人中心</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center dark:bg-slate-900 dark:border-slate-800">
                    <div className="relative mb-4 group cursor-pointer">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md dark:border-slate-700 dark:bg-blue-900 dark:text-blue-300">
                            {user.avatar || user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user.username}</h2>
                    <p className="text-slate-500 text-sm mb-4 dark:text-slate-400">System {user.role}</p>
                    
                    <div className="w-full space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Mail size={16} className="mr-3 text-slate-400 dark:text-slate-500" />
                            {user.email}
                        </div>
                         <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Shield size={16} className="mr-3 text-slate-400 dark:text-slate-500" />
                            Role: {user.role}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <MapPin size={16} className="mr-3 text-slate-400 dark:text-slate-500" />
                            Beijing, China
                        </div>
                         <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Calendar size={16} className="mr-3 text-slate-400 dark:text-slate-500" />
                            Joined: Jan 2024
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Settings Form */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-100 dark:text-white dark:border-slate-800">基本资料</h3>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="用户名" defaultValue={user.username} disabled className="bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" />
                            <Input label="显示名称" defaultValue={user.username} className="dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                            <Input label="电子邮件" defaultValue={user.email} className="dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                            <Input label="手机号码" defaultValue="+86 138 0000 0000" className="dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                            
                            {/* Added Gender and Age */}
                            <div>
                                <Select 
                                    label="性别"
                                    options={[
                                        { label: '男', value: 'male' },
                                        { label: '女', value: 'female' },
                                        { label: '其他', value: 'other' },
                                    ]}
                                />
                            </div>
                            <Input label="年龄" type="number" defaultValue={25} className="dark:bg-slate-800 dark:text-white dark:border-slate-700" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">个人简介</label>
                            <textarea 
                                className="block w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                defaultValue="负责系统整体架构维护与向量数据库调优。"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button>保存更改</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
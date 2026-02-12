import React from 'react';
import { User, Mail, Shield, Calendar, MapPin, Camera } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">个人中心</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
                    <div className="relative mb-4 group cursor-pointer">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md">
                            AD
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-800">Administrator</h2>
                    <p className="text-slate-500 text-sm mb-4">System Super Admin</p>
                    
                    <div className="w-full space-y-3 border-t border-slate-100 pt-4">
                        <div className="flex items-center text-sm text-slate-600">
                            <Mail size={16} className="mr-3 text-slate-400" />
                            admin@vector.com
                        </div>
                         <div className="flex items-center text-sm text-slate-600">
                            <Shield size={16} className="mr-3 text-slate-400" />
                            Role: Administrator
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <MapPin size={16} className="mr-3 text-slate-400" />
                            Beijing, China
                        </div>
                         <div className="flex items-center text-sm text-slate-600">
                            <Calendar size={16} className="mr-3 text-slate-400" />
                            Joined: Jan 2024
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Settings Form */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-100">基本资料</h3>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="用户名" defaultValue="admin" disabled className="bg-slate-50" />
                            <Input label="显示名称" defaultValue="Administrator" />
                            <Input label="电子邮件" defaultValue="admin@vector.com" />
                            <Input label="手机号码" defaultValue="+86 138 0000 0000" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">个人简介</label>
                            <textarea 
                                className="block w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                                defaultValue="负责系统整体架构维护与向量数据库调优。"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button>保存更改</Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-100">安全设置</h3>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <div className="font-medium text-slate-700">两步验证 (2FA)</div>
                            <div className="text-xs text-slate-500">为您的账户添加额外的安全保护层。</div>
                        </div>
                        <Button variant="secondary" size="sm">启用</Button>
                    </div>
                    <div className="flex items-center justify-between py-4 border-t border-slate-50 mt-2">
                        <div>
                            <div className="font-medium text-slate-700">修改密码</div>
                            <div className="text-xs text-slate-500">定期修改密码以保护账户安全。</div>
                        </div>
                        <Button variant="secondary" size="sm">修改</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { generateCaptcha } from '../utils';
import { User, Lock, RefreshCw, Key, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../config';
import { useToast } from '../components/Toast';
import { useStore } from '../store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const { error: toastError, success: toastSuccess } = useToast();
  
  const [captchaCode, setCaptchaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Zod Schema Definition
  const loginSchema = z.object({
    username: z.string().min(1, '请输入用户名'),
    password: z.string().min(1, '请输入密码'),
    captcha: z.string().min(1, '请输入验证码').refine((val) => val.toUpperCase() === captchaCode, {
      message: '验证码错误',
    }),
  });

  type LoginFormInputs = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    resetField,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      captcha: '',
    }
  });

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    resetField('captcha'); // Clear captcha field on refresh
  };

  useEffect(() => {
    refreshCaptcha();
    const expires = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME);
    if (expires && new Date().getTime() < parseInt(expires)) {
        toastSuccess('欢迎回来 (免登录)');
        // Try to restore user from storage if remember me is valid
        const savedUser = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
        if (savedUser) {
            dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
        }
        navigate(APP_CONFIG.ROUTES.DASHBOARD);
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
        setLoading(false);
        if (data.username === 'admin' && data.password === '123456') {
            const user = { 
                username: 'admin', 
                role: 'admin', 
                email: 'admin@vector.com',
                avatar: 'AD'
            };
            
            // Persist Login
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, 'mock-jwt-token');
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(user));
            
            // Update Global Store
            dispatch({ type: 'SET_USER', payload: user });

            if (rememberMe) {
                const sevenDaysLater = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
                localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME, sevenDaysLater.toString());
            } else {
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME);
            }
            toastSuccess('登录成功');
            navigate(APP_CONFIG.ROUTES.DASHBOARD);
        } else if (data.username === 'editor' && data.password === '123456') {
             // Demo Editor User
             const user = { username: 'editor', role: 'editor', email: 'editor@vector.com', avatar: 'ED' };
             localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, 'mock-jwt-token-editor');
             localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(user));
             dispatch({ type: 'SET_USER', payload: user });
             navigate(APP_CONFIG.ROUTES.DASHBOARD);
        } else {
            // Mock Error
            toastError('登录失败: 用户名或密码错误');
            refreshCaptcha();
        }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
        {/* Left Side - Hero / Info */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
            {/* Background Decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2929&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/90 to-slate-900/95"></div>
            </div>

            <div className="relative z-10 text-white max-w-lg">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-8 shadow-xl shadow-blue-500/20"
                >
                    V
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl font-bold mb-6 tracking-tight"
                >
                    VectorAdmin Pro
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-blue-100 leading-relaxed mb-8"
                >
                    企业级向量数据库管理系统。
                    <br/>提供可视化的向量管理、高性能检索与全链路监控。
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4 text-sm font-medium text-blue-200"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div> 向量检索
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div> 权限管控
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div> 审计日志
                    </div>
                </motion.div>
            </div>

            {/* Floating Shapes */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-40 -right-40 w-96 h-96 border border-white/10 rounded-full"
            />
             <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute top-20 right-20 w-64 h-64 border border-blue-500/20 rounded-full border-dashed"
            />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white p-10 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
            >
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">欢迎回来</h2>
                    <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">请填写以下信息登录您的账户</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="用户名"
                        placeholder="请输入用户名 (admin / editor)"
                        leftIcon={<User size={18} />}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        error={errors.username?.message}
                        {...register('username')}
                    />
                    
                    <div>
                        <Input
                            label="密码"
                            type="password"
                            placeholder="请输入密码 (123456)"
                            leftIcon={<Lock size={18} />}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                         <div className="flex justify-end mt-1">
                            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">忘记密码?</a>
                         </div>
                    </div>

                    <div className="flex space-x-3 items-start">
                        <div className="flex-1">
                            <Input
                                label="验证码"
                                placeholder="4位字符"
                                leftIcon={<Key size={18} />}
                                className="uppercase dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                error={errors.captcha?.message}
                                {...register('captcha')}
                            />
                        </div>
                        <div 
                            className="h-[42px] w-28 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center font-mono text-xl font-bold tracking-widest text-slate-600 select-none cursor-pointer relative overflow-hidden group transition-all hover:border-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 mt-[26px]"
                            onClick={refreshCaptcha}
                            title="点击刷新"
                        >
                            <span className="z-10">{captchaCode}</span>
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                <RefreshCw size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                            记住登录状态 (7天)
                        </label>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-11 text-base group" 
                        size="lg"
                        isLoading={loading}
                    >
                        立即登录
                        {!loading && <ArrowRight size={18} className="ml-2 opacity-80 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </form>
                
                <div className="mt-8 text-center text-xs text-slate-400">
                    &copy; 2024 VectorAdmin Pro. All rights reserved.
                </div>
            </motion.div>
        </div>
    </div>
  );
};
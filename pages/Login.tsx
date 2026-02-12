import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Lock, RefreshCw, Key, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../config';
import { useToast } from '../components/Toast';
import { useStore } from '../store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '../api'; // Real API

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useStore();
  const { error: toastError, success: toastSuccess } = useToast();
  
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Zod Schema Definition
  const loginSchema = z.object({
    username: z.string().min(1, '请输入用户名'),
    password: z.string().min(1, '请输入密码'),
    captcha: z.string().min(1, '请输入验证码'),
  });

  type LoginFormInputs = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
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

  const refreshCaptcha = async () => {
    try {
        const res = await authApi.getCaptcha();
        if(res.code === 200) {
            setCaptchaKey(res.data.key);
            setCaptchaUrl(res.data.image); // Assuming Backend returns base64 image
        }
    } catch (e) {
        console.error("Captcha fetch failed");
    }
    resetField('captcha');
  };

  useEffect(() => {
    refreshCaptcha();
    const expires = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME);
    if (expires && new Date().getTime() < parseInt(expires)) {
        // Token logic handled by axios interceptor, here we just check if we have user info
        const savedUser = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
        if (savedUser) {
            dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
            navigate(APP_CONFIG.ROUTES.DASHBOARD);
        }
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
        const res = await authApi.login({
            ...data,
            key: captchaKey
        });

        if (res.code === 200) {
            const { token, user } = res.data;
            
            // Persist Login
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(user));
            
            // Update Global Store
            dispatch({ type: 'SET_USER', payload: user });

            if (rememberMe) {
                const sevenDaysLater = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
                localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME, sevenDaysLater.toString());
            } else {
                localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_ME);
            }
            
            // Fetch Menu permissions if needed here, or let MainLayout handle it
            
            toastSuccess('登录成功');
            navigate(APP_CONFIG.ROUTES.DASHBOARD);
        }
    } catch (err: any) {
        toastError(err.message || '登录失败');
        refreshCaptcha();
    } finally {
        setLoading(false);
    }
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
            </div>
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
                        placeholder="请输入用户名"
                        leftIcon={<User size={18} />}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        error={errors.username?.message}
                        {...register('username')}
                    />
                    
                    <div>
                        <Input
                            label="密码"
                            type="password"
                            placeholder="请输入密码"
                            leftIcon={<Lock size={18} />}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            error={errors.password?.message}
                            {...register('password')}
                        />
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
                            className="h-[42px] w-28 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer dark:bg-slate-800 dark:border-slate-700 mt-[26px]"
                            onClick={refreshCaptcha}
                            title="点击刷新"
                        >
                            {captchaUrl ? (
                                <img src={captchaUrl} alt="Captcha" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-slate-400">加载中...</span>
                            )}
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
            </motion.div>
        </div>
    </div>
  );
};
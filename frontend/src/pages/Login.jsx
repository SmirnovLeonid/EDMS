import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Неверное имя пользователя или пароль');
                } else {
                    setError(`Ошибка сервера: ${err.response.status}`);
                }
            } else if (err.request) {
                setError('Ошибка сети: сервер недоступен');
            } else {
                setError('Произошла ошибка');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Glass card */}
                <div
                    className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                    }}
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
                            <Sparkles size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">ИС ЭДО</h1>
                        <p className="text-indigo-300 text-sm">Система электронного документооборота</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 backdrop-blur border border-red-500/30 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-indigo-200 text-sm font-medium mb-2">Имя пользователя</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-300"
                                    placeholder="Введите логин"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-indigo-200 text-sm font-medium mb-2">Пароль</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-300"
                                    placeholder="Введите пароль"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Войти в систему
                                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-indigo-400/60">
                        © 2024 Система электронного документооборота ВУЗа
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

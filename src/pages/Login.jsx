import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';
import '../styles/Login.css';

const Login = () => {
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef([]);

    useEffect(() => {
        emailjs.init('C9zRiNWAGBzI2tFpv');
    }, []);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const currentTime = new Date().toLocaleTimeString();

        try {
            console.log('Sending OTP to:', email);
            const response = await emailjs.send(
                'service_ywilcxq',
                'template_dn8sx25',
                {
                    email: email,
                    passcode: newOtp,
                    time: currentTime
                },
                'C9zRiNWAGBzI2tFpv'
            );
            
            console.log('EmailJS Status:', response.status);
            console.log(`[DEBUG] OTP: ${newOtp}`);
            
            if (response.status === 200) {
                setGeneratedOtp(newOtp);
                setStep('otp');
            } else {
                setError('Service failure. Please try again.');
            }
        } catch (err) {
            console.error('EmailJS Error:', err);
            setError('Failed to send OTP. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        const otpString = otp.join('');
        
        await new Promise(resolve => setTimeout(resolve, 500));

        if (otpString === generatedOtp) {
            localStorage.setItem('isAuthenticated', 'true');
            setStep('success');
        } else {
            setError('Invalid code. Please try again.');
        }
        setLoading(false);
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="login-container">
            <motion.div 
                className="login-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <AnimatePresence mode="wait">
                    {step === 'email' && (
                        <motion.div
                            key="email-step"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="login-header">
                                <h1>Login</h1>
                                <p>Enter email to receive an OTP</p>
                            </div>

                            <form onSubmit={handleSendOtp}>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input 
                                            type="email" 
                                            className="login-input" 
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {error && <p className="error-msg">{error}</p>}
                                </div>

                                <button type="submit" className="primary-btn" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Code'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 'otp' && (
                        <motion.div
                            key="otp-step"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="login-header">
                                <h1>Verification</h1>
                                <p>Checking code for {email}</p>
                            </div>

                            <form onSubmit={handleVerifyOtp}>
                                <div className="otp-inputs">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (otpRefs.current[idx] = el)}
                                            type="text"
                                            maxLength="1"
                                            className="otp-digit"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            required
                                        />
                                    ))}
                                </div>
                                {error && <p className="error-msg">{error}</p>}

                                <button type="submit" className="primary-btn" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
                                </button>

                                <button type="button" className="secondary-btn" onClick={() => setStep('email')}>
                                    Change email
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success-step"
                            className="success-badge"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                        >
                            <CheckCircle2 size={48} color="#4ade80" />
                            <h2>Login Success</h2>
                            <button className="primary-btn" onClick={() => window.location.href = '/'}>
                                Enter Studio
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Login;

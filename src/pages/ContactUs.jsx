import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactUs = () => {
    const form = useRef();
    const [status, setStatus] = useState('');

    const sendEmail = (e) => {
        e.preventDefault();
        setStatus('sending');

        emailjs.sendForm(
            'service_rvya9wf',
            'template_hd0k50a',
            form.current,
            'x_kRbuPOEGreRuBaS'
        ).then(
            () => {
                setStatus('success');
                form.current.reset();
                setTimeout(() => setStatus(''), 5000);
            },
            (error) => {
                console.log('FAILED...', error.text);
                setStatus('error');
            }
        );
    };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center', fontWeight: '800' }}
            >
                Contact Us
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ textAlign: 'center', color: '#aaa', marginBottom: '4rem', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 4rem' }}
            >
                Have questions or need assistance? We're here to help! Reach out to the Universal Studio team using the form below.
            </motion.p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                {/* Contact Information */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '2.5rem', borderRadius: '15px', border: '1px solid var(--glass-border)' }}
                >
                    <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', color: 'var(--accent-gold)' }}>Get in Touch</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '50%' }}>
                                <Mail size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: '#ccc' }}>Email</h4>
                                <p style={{ margin: 0, color: 'white' }}>support@universal-studio.com</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '50%' }}>
                                <Phone size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: '#ccc' }}>Phone</h4>
                                <p style={{ margin: 0, color: 'white' }}>+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '50%' }}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: '#ccc' }}>Office</h4>
                                <p style={{ margin: 0, color: 'white' }}>123 Studio Way<br />San Francisco, CA 94107</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <form ref={form} onSubmit={sendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Your Name</label>
                            <input
                                type="text"
                                name="user_name"
                                required
                                placeholder="John Doe"
                                style={{
                                    width: '100%', padding: '12px 15px', borderRadius: '8px',
                                    border: '1px solid #444', background: 'rgba(0,0,0,0.3)', color: 'white',
                                    fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Email Address</label>
                            <input
                                type="email"
                                name="user_email"
                                required
                                placeholder="john@example.com"
                                style={{
                                    width: '100%', padding: '12px 15px', borderRadius: '8px',
                                    border: '1px solid #444', background: 'rgba(0,0,0,0.3)', color: 'white',
                                    fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Message</label>
                            <textarea
                                name="message"
                                required
                                placeholder="How can we help you?"
                                rows={5}
                                style={{
                                    width: '100%', padding: '12px 15px', borderRadius: '8px',
                                    border: '1px solid #444', background: 'rgba(0,0,0,0.3)', color: 'white',
                                    fontSize: '1rem', outline: 'none', resize: 'vertical'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: '15px', background: 'var(--accent-gold)', color: 'black',
                                border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold',
                                cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.opacity = 0.9}
                            onMouseOut={(e) => e.target.style.opacity = 1}
                            disabled={status === 'sending'}
                        >
                            <Send size={20} /> {status === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>

                        {status === 'success' && <p style={{ color: '#4caf50', margin: 0 }}>Message sent successfully!</p>}
                        {status === 'error' && <p style={{ color: '#ef4444', margin: 0 }}>Failed to send message. Please try again.</p>}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactUs;

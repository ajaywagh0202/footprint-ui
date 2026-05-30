

import React, { useEffect, useState } from 'react';
import '../index.css';
import './LoginScreen.css';
import { Login } from '../ApiController/api';
import bg from '../assets/login-background.png';
import logo from '../assets/indian.png';

const createCaptcha = () => {
    const first = Math.floor(Math.random() * 9) + 1;
    const second = Math.floor(Math.random() * 9) + 1;

    return {
        question: `${first} + ${second}`,
        answer: String(first + second),
    };
};

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [captcha, setCaptcha] = useState(() => createCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    const [activeTab, setActiveTab] = useState('login');

    // registration fields
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regEmployeeId, setRegEmployeeId] = useState('');

    useEffect(() => {
        // Check if user is already authenticated
        const token = localStorage.getItem('authToken');
        if (token) {
            // Optionally, verify token with backend here
            window.location.href = '/dashboard';
        }
    }, []);
    
    const handleLogin = async (e) => {
        e?.preventDefault();

        if (captchaInput.trim() !== captcha.answer) {
            setCaptchaError('Captcha answer is incorrect.');
            setCaptcha(createCaptcha());
            setCaptchaInput('');
            return;
        }

        try {
            const loginResult = await Login(username, password);
            console.log('Login result:', loginResult);
            
            if (loginResult) {
                localStorage.setItem('authToken', loginResult.access_token);
                localStorage.setItem('user', loginResult? JSON.stringify(loginResult) : '{}');
                window.location.href = '/dashboard';
                return;
            }

            setCaptchaError('Invalid username or password.');
        } catch (error) {
            setCaptchaError(error.message || 'Login failed. Please try again.');
        }

        setCaptcha(createCaptcha());
        setCaptchaInput('');
    };

    const handleRegister = (e) => {
        e?.preventDefault();
        console.log('Registering user:', { regUsername, regEmail, regPassword, regEmployeeId });
    };

    const refreshCaptcha = () => {
        setCaptcha(createCaptcha());
        setCaptchaInput('');
        setCaptchaError('');
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${bg})` }}>
            <div className="login-overlay" />

            <div className="login-wrapper ">
                <div className="combined-card glass-card">
                    <div className="left-card">
                        <div className="left-inner">
                            <div className="inline-logo">
                                <img src={logo} alt="logo" className="logo" />
                                <div className="brand">CENTRAL RAILWAYS</div>
                            </div>
                            <h1 className="hero">INFORMATION TECHNOLOGY CENTER</h1>
                            <p className="lead"></p>
                        </div>
                    </div>

                    <div className="right-card">
                        <form className="glass-card" onSubmit={activeTab === 'login' ? handleLogin : handleRegister} aria-label={activeTab === 'login' ? 'Login form' : 'Registration form'}>
                            <div className="tabs">
                                <button type="button" className={"tab " + (activeTab === 'login' ? 'active' : '')} onClick={() => setActiveTab('login')}>Login</button>
                                <button type="button" disabled={true} className={"tab " + (activeTab === 'register' ? 'active' : '')} onClick={() => setActiveTab('register')}>Register</button>
                            </div>

                            <h2 className="title">{activeTab === 'login' ? 'Welcome back!' : 'Create an account'}</h2>
                            <p className="subtitle">{activeTab === 'login' ? 'Login to your Dashboard' : 'Register to access the portal'}</p>
                            {activeTab === 'login' ? (
                                <>
                                    <label className="field">
                                        <span className="label-text">Email</span>
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <label className="field">
                                        <span className="label-text">Password</span>
                                        <input
                                            type="password"
                                            placeholder="************"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <div className="row between">

                                    </div>

                                    <label className="field">
                                        <span className="label-text">Captcha</span>
                                        <div className="captcha-row">
                                            <div className="captcha-question">{captcha.question} = ?</div>
                                            <button type="button" className="captcha-refresh" onClick={refreshCaptcha}>Refresh</button>
                                        </div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Enter captcha answer"
                                            value={captchaInput}
                                            onChange={(e) => {
                                                setCaptchaInput(e.target.value);
                                                setCaptchaError('');
                                            }}
                                            required
                                        />
                                        {captchaError ? <span className="captcha-error">{captchaError}</span> : null}
                                    </label>

                                    <button className="signin" type="submit">Login</button>
                                </>
                            ) : (
                                <>
                                    <label className="field">
                                        <span className="label-text">Username</span>
                                        <input type="text" placeholder="Enter username" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
                                    </label>

                                    <label className="field">
                                        <span className="label-text">Email</span>
                                        <input type="email" placeholder="Enter email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                                    </label>

                                    <label className="field">
                                        <span className="label-text">Password</span>
                                        <input type="password" placeholder="Create a password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                                    </label>

                                    <label className="field">
                                        <span className="label-text">Employee ID</span>
                                        <input type="text" placeholder="Employee ID" value={regEmployeeId} onChange={(e) => setRegEmployeeId(e.target.value)} required />
                                    </label>

                                    <button className="signin" type="submit">Register</button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

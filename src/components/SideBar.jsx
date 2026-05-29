import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/indian.png';
import './SideBar.css';

const navItems = [
    { label: 'Dashboard', short: 'D', path: '/dashboard', icon: 'fas fa-home' },
    { label: 'Railways Ai', short: 'C', path: '/chatbot', icon: 'fa-solid fa-brain' },
    { label: 'Rates Branch System', short: 'RBS', path: '/rates-branch-system', icon: 'fa-solid fa-route' },
    { label: 'Data Master', short: 'DM', path: '/master', icon: 'fa-solid fa-database' },
];

export default function SideBar() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <img src={logo} alt="Central Railways logo" className="sidebar-logo-image" />
                </div>
                <div>
                    <div className="sidebar-title">CENTRAL RAILWAYS</div>
                    <div className="sidebar-subtitle">Information Technology Center</div>
                </div>
            </div>

            <nav className="sidebar-nav" aria-label="Dashboard navigation">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="sidebar-link-icon"><i className={item.icon}></i></span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/indian.png';
import './SideBar.css';

const navItems = [
    { label: 'Dashboard',          short: 'D',   path: '/dashboard',           icon: 'fas fa-home' },
    { label: 'Railways Ai',        short: 'C',   path: '/chatbot',             icon: 'fa-solid fa-brain' },
    { label: 'Rates Branch System',short: 'RBS', path: '/rates-branch-system', icon: 'fa-solid fa-route' },
    {
        label: 'Data Master', short: 'DM', path: '', icon: 'fa-solid fa-database',
        subMenu: [
            { label: 'Railway Master', path: '/master', icon: 'fa-solid fa-train' },
            { label: 'Station Master', path: '/station', icon: 'fa-solid fa-building' },
        ],
    },
];

export default function SideBar() {
    const location  = useLocation();
    const navigate  = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (label) => {
        setOpenMenu(prev => prev === label ? null : label);
    };

    const isParentActive = (item) =>
        item.subMenu?.some(sub => location.pathname === sub.path) ||
        location.pathname === item.path;

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
                    <div key={item.label} className="sidebar-item-wrapper">

                        {/* Parent Button */}
                        <button
                            type="button"
                            className={`sidebar-link ${isParentActive(item) ? 'active' : ''}`}
                            onClick={() =>
                                item.subMenu ? toggleMenu(item.label) : navigate(item.path)
                            }
                        >
                            <span className="sidebar-link-icon">
                                <i className={item.icon}></i>
                            </span>
                            <span className="sidebar-link-label">{item.label}</span>

                            {/* Dropdown Arrow */}
                            {item.subMenu && (
                                <span className="sidebar-arrow">
                                    <i className={`fas fa-chevron-${openMenu === item.label ? 'up' : 'down'}`}></i>
                                </span>
                            )}
                        </button>

                        {/* Sub Menu */}
                        {item.subMenu && openMenu === item.label && (
                            <div className="sidebar-submenu">
                                {item.subMenu.map((sub) => (
                                    <button
                                        key={sub.label}
                                        type="button"
                                        className={`sidebar-submenu-link ${location.pathname === sub.path ? 'active' : ''}`}
                                        onClick={() => navigate(sub.path)}
                                    >
                                        <span className="sidebar-link-icon">
                                            <i className={sub.icon}></i>
                                        </span>
                                        <span>{sub.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>
                ))}
            </nav>
        </aside>
    );
}
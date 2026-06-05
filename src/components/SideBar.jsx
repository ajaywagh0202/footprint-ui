import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/indian.png';
import './SideBar.css';

const navItems = [
    { label: 'Dashboard',          short: 'D',   path: '/dashboard',           icon: 'fas fa-home' },
    { label: 'Railways Ai',        short: 'C',   path: '/chatbot',             icon: 'fa-solid fa-brain' },
    // { label: 'Rates Branch System',short: 'RBS', path: '/rates-branch-system', icon: 'fa-solid fa-route' },
    {
        label: 'MDM', short: 'DM', path: '', icon: 'fa-solid fa-database',
        children: [
            {
                label: 'Knowledge Warehouse', icon: 'fa-solid fa-boxes-stacked', path: '',
                children: [
                    { label: 'Add Document', path: '/create-dictionary', icon: 'fa-solid fa-file-import'},
                    { label: 'Accounts Department', path: '/dictionary', icon: 'fa-solid fa-chart-line' , dept_code: 'ACCOUNTS'},
                    { label: 'Commercial Department', path: '/dictionary', icon: 'fa-solid fa-money-bill-wave', dept_code: 'COMMERCIAL' },
                    { label: 'Construction Department', path: '/dictionary', icon: 'fa-solid fa-building' , dept_code: 'CONSTRUCTION' },
                    { label: 'Electrical Department', path: '/dictionary', icon: 'fa-solid fa-bolt', dept_code: 'ELECTRICAL' },
                    { label: 'Engineering Department', path: '/dictionary', icon: 'fa-solid fa-hard-hat', dept_code: 'ENGINEERING' },
                    { label: 'Environment and Housekeeping Management', path: '/dictionary', icon: 'fa-solid fa-leaf', dept_code: 'ENVIRONMENT_AND_HOUSEKEEPING_MANAGEMENT' },
                    { label: 'General Administration Department', path: '/dictionary', icon: 'fa-solid fa-building-user', dept_code: 'GENERAL_ADMINISTRATION' },
                    { label: 'Mechanical Department', path: '/dictionary', icon: 'fa-solid fa-cogs', dept_code: 'MECHANICAL' },
                    { label: 'Medical Department', path: '/dictionary', icon: 'fa-solid fa-notes-medical', dept_code: 'MEDICAL' },
                    { label: 'Operating Department', path: '/dictionary', icon: 'fa-solid fa-train', dept_code: 'OPERATING' },
                    { label: 'Personnel Department', path: '/dictionary', icon: 'fa-solid fa-users', dept_code: 'PERSONNEL' },
                    { label: 'Public Relations Department', path: '/dictionary', icon: 'fa-solid fa-bullhorn', dept_code: 'PUBLIC_RELATIONS' },
                    { label: 'Rajbhasha Department', path: '/dictionary', icon: 'fa-solid fa-language', dept_code: 'RAJBHASHA' },
                    { label: 'Safety Department', path: '/dictionary', icon: 'fa-solid fa-shield-alt', dept_code: 'SAFETY' },
                    { label: 'Security Department', path: '/dictionary', icon: 'fa-solid fa-lock', dept_code: 'SECURITY' },
                    { label: 'Signal & Telecommunications Department', path: '/dictionary', icon: 'fa-solid fa-wifi', dept_code: 'SIGNAL_AND_TELECOMMUNICATIONS' },
                    { label: 'Statistical Department', path: '/dictionary', icon: 'fa-solid fa-chart-simple', dept_code: 'STATISTICAL' },
                    { label: 'Stores Department', path: '/dictionary', icon: 'fa-solid fa-archive', dept_code: 'STORES' },
                    { label: 'Vigilance Department', path: '/dictionary', icon: 'fa-solid fa-eye', dept_code: 'VIGILANCE' }
                    ]
            },
            {
                label: 'Master', path: '', icon: 'fa-solid fa-train',
                children: [
                    { label: 'Master Dashboard', path: '/master', icon: 'fa-solid fa-train' },
                    { label: 'Transaction Dashboard', path: '/transaction', icon: 'fa-solid fa-building' },
                ]
            },
        ]
    },
];

const getFirstDepartmentCode = () => {
    const mdmMenu = navItems.find(item => item.label === 'MDM');
    const knowledgeWarehouse = mdmMenu?.children?.find(item => item.label === 'Knowledge Warehouse');

    return knowledgeWarehouse?.children?.find(item => item.dept_code)?.dept_code || '';
};

// Recursive component to render menu items and nested submenus
function SidebarNavItem({ item, currentPath, selectedDeptCode, navigate, openMenus, toggleMenu, parentKey, closeMobileMenu }) {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = Boolean(item.path && item.path === currentPath);
    const isOpen = openMenus[parentKey];

    const handleClick = () => {
        if (hasChildren) {
            toggleMenu(parentKey);
        } else if (item.path) {
            navigate({
                pathname: item.path,
                search: item.dept_code ? `?dept_code=${item.dept_code}` : ''
            });
            closeMobileMenu();
        }
    };

    return (
        <div className="sidebar-item-wrapper">
            <button
                type="button"
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={handleClick}
            >
                <span className="sidebar-link-icon">
                    <i className={item.icon}></i>
                </span>
                <span className="sidebar-link-label">{item.label}</span>
                {hasChildren && (
                    <span className="sidebar-arrow">
                        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                    </span>
                )}
            </button>

            {hasChildren && isOpen && (
                <div className="sidebar-submenu">
                    {item.children.map((child, idx) => {
                        const childKey = `${parentKey}-${child.label}`;
                        // If child has its own children, render recursively, otherwise as a simple link
                        if (child.children && child.children.length > 0) {
                            return (
                                <SidebarNavItem
                                    key={childKey}
                                    item={child}
                                    currentPath={currentPath}
                                    selectedDeptCode={selectedDeptCode}
                                    navigate={navigate}
                                    openMenus={openMenus}
                                    toggleMenu={toggleMenu}
                                    parentKey={childKey}
                                    closeMobileMenu={closeMobileMenu}
                                />
                            );
                        } else {
                            return (
                                // Department links share the same route, so dept_code decides the selected row.
                                <button
                                    key={childKey}
                                    type="button"
                                    className={`sidebar-submenu-link ${
                                        child.dept_code
                                            ? selectedDeptCode === child.dept_code ? 'active' : ''
                                            : currentPath === child.path ? 'active' : ''
                                    }`}
                                    onClick={() => {
                                        navigate({
                                            pathname: child.path,
                                            search: child.dept_code ? `?dept_code=${child.dept_code}` : ''
                                        });
                                        closeMobileMenu();
                                    }}
                                >
                                    <span className="sidebar-link-icon">
                                        <i className={child.icon}></i>
                                    </span>
                                    <span>{child.label}</span>
                                </button>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
}

export default function SideBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedDeptCode = useMemo(() => (
        new URLSearchParams(location.search).get('dept_code') || getFirstDepartmentCode()
    ), [location.search]);
    const [openMenus, setOpenMenus] = useState({
        MDM: location.pathname === '/dictionary',
        'MDM-Knowledge Warehouse': location.pathname === '/dictionary'
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (location.pathname === '/dictionary' && !new URLSearchParams(location.search).get('dept_code')) {
            navigate({
                pathname: '/dictionary',
                search: `?dept_code=${getFirstDepartmentCode()}`
            }, { replace: true });
        }
    }, [location.pathname, location.search, navigate]);

    const toggleMenu = (key) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userCode');
        localStorage.removeItem('userName');
        setIsMobileMenuOpen(false);
        navigate('/login', { replace: true });
    };

    return (
        <>
        <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <img src={logo} alt="Central Railways logo" className="sidebar-logo-image" />
                </div>
                <div>
                    <div className="sidebar-title">CENTRAL RAILWAYS</div>
                    <div className="sidebar-subtitle">Information Technology Center</div>
                </div>
                <button
                    type="button"
                    className="sidebar-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(prev => !prev)}
                    aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isMobileMenuOpen}
                >
                    <i className={`fas fa-${isMobileMenuOpen ? 'times' : 'bars'}`}></i>
                </button>
            </div>

            <nav className="sidebar-nav" aria-label="Dashboard navigation">
                {navItems.map((item, idx) => (
                    <SidebarNavItem
                        key={item.label}
                        item={item}
                        currentPath={location.pathname}
                        selectedDeptCode={selectedDeptCode}
                        navigate={navigate}
                        openMenus={openMenus}
                        toggleMenu={toggleMenu}
                        parentKey={item.label}
                        closeMobileMenu={() => setIsMobileMenuOpen(false)}
                    />
                ))}
            </nav>

            <div className="sidebar-footer">
                <button type="button" className="sidebar-logout-button" onClick={handleLogout}>
                    <span className="sidebar-link-icon">
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
        {isMobileMenuOpen && (
            <button
                type="button"
                className="sidebar-mobile-backdrop"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
        </>
    );
}

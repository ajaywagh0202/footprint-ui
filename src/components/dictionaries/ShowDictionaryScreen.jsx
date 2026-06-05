import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import SideBar from '../SideBar';
import '../../screen/DashboardScreen.css';
import '../../screen/MasterTableScreen.css';

const DEFAULT_DEPT_CODE = 'ACCOUNTS';
const FILTERS = ['All', 'Original', 'Revised'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Date (Newest First)' },
    { value: 'oldest', label: 'Date (Oldest First)' },
    { value: 'name', label: 'Name (A to Z)' }
];
const PAGE_SIZE = 10;
const fileIconColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#0ea5e9', '#6366f1', '#ec4899'];

const getBaseUrl = () => (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.BACKEND_URL ||
    'http://127.0.0.1:8000'
);

const getManualsBaseUrl = () => {
    const normalizedBaseUrl = getBaseUrl().endsWith('/') ? getBaseUrl().slice(0, -1) : getBaseUrl();

    return normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
};

const getAuthToken = () => {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage.getItem('authToken') || localStorage.getItem('token');
};

const joinUrl = (baseUrl, path) => {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBaseUrl}${normalizedPath}`;
};

const getFileBaseUrl = () => getBaseUrl().replace(/\/api\/?$/, '').replace(/\/$/, '');

const formatFileSize = (sizeKb) => {
    const value = Number(sizeKb);

    if (!Number.isFinite(value)) {
        return '0 KB';
    }

    if (value >= 1024) {
        return `${(value / 1024).toFixed(1)} MB`;
    }

    return `${value} KB`;
};

const formatDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export default function ShowDictionaryScreen({ dept_code }) {
    const [searchParams] = useSearchParams();
    const selectedDeptCode = dept_code || searchParams.get('dept_code') || DEFAULT_DEPT_CODE;
    const [department, setDepartment] = useState(null);
    const [manuals, setManuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPdf, setSelectedPdf] = useState(null);

    const loadManuals = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const token = getAuthToken();
            const response = await axios.get(
                joinUrl(getManualsBaseUrl(), `/manuals/department/${selectedDeptCode}?is_active=true`),
                {
                    headers: {
                        accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                }
            );

            setDepartment(response.data?.data || null);
            setManuals(Array.isArray(response.data?.data?.manuals) ? response.data.data.manuals : []);
        } catch {
            setDepartment(null);
            setManuals([]);
            setError('Failed to load manuals for this department. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedDeptCode]);

    useEffect(() => {
        setActiveFilter('All');
        setSortBy('newest');
        setSearchText('');
        setCurrentPage(1);
        loadManuals();
    }, [loadManuals]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchText, sortBy]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setSelectedPdf(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const displayedManuals = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();
        const versionFilteredManuals = activeFilter === 'All'
            ? manuals
            : manuals.filter(manual => manual.version_type === activeFilter);
        const filteredManuals = normalizedSearchText
            ? versionFilteredManuals.filter(manual => (
                `${manual.file_name || ''} ${manual.display_title || ''}`
                    .toLowerCase()
                    .includes(normalizedSearchText)
            ))
            : versionFilteredManuals;

        return [...filteredManuals].sort((first, second) => {
            if (sortBy === 'oldest') {
                return new Date(first.created_at) - new Date(second.created_at);
            }

            if (sortBy === 'name') {
                return (first.display_title || '').localeCompare(second.display_title || '');
            }

            return new Date(second.created_at) - new Date(first.created_at);
        });
    }, [activeFilter, manuals, searchText, sortBy]);

    const totalPages = Math.max(1, Math.ceil(displayedManuals.length / PAGE_SIZE));
    const paginatedManuals = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;

        return displayedManuals.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentPage, displayedManuals]);

    const openPdf = (manual) => {
        const pdfUrl = manual?.file_url || (manual?.file_path ? `${getFileBaseUrl()}/files/${encodeURI(manual.file_path)}` : '');

        if (!pdfUrl) {
            return;
        }

        setSelectedPdf({
            title: manual.display_title || manual.file_name || 'Manual PDF',
            url: `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`
        });
    };

    return (
        <div className="dashboard-shell">
            <SideBar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>{department?.department_name || selectedDeptCode}</h1>
                        <p>{manuals.length} Manuals Found</p>
                    </div>
                </header>

                <section style={styles.toolbar} aria-label="Dictionary filters">
                    <label style={styles.searchBox}>
                        <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon}></i>
                        <input
                            type="search"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Search file name"
                            style={styles.searchInput}
                            aria-label="Search file name"
                        />
                    </label>

                    <div style={styles.filterGroup}>
                        {FILTERS.map(filter => (
                            <button
                                key={filter}
                                type="button"
                                style={{
                                    ...styles.filterButton,
                                    ...(activeFilter === filter ? styles.filterButtonActive : {})
                                }}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        style={styles.sortSelect}
                        aria-label="Sort manuals"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </section>

                {loading && (
                    <div className="table-state">
                        <span className="loading-spinner" aria-hidden="true"></span>
                        <span>Loading manuals</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="table-state error-state" style={styles.errorState}>
                        <span>{error}</span>
                        <button type="button" className="table-close-btn" onClick={loadManuals}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && displayedManuals.length === 0 && (
                    <div className="table-state">
                        No manuals found for the selected filter.
                    </div>
                )}

                {!loading && !error && displayedManuals.length > 0 && (
                    <section style={styles.fileTable} aria-label="Department manuals">
                        <div style={styles.fileHeader}>
                            <span>File Name</span>
                            <span>Last Changes</span>
                            <span>File Size</span>
                            <span>Access</span>
                            <span></span>
                            <span></span>
                        </div>

                        <div style={styles.fileRows}>
                            {paginatedManuals.map((manual, index) => (
                                <article key={manual.id} style={styles.fileRow}>
                                    <div style={styles.fileNameCell}>
                                        <span
                                            style={{
                                                ...styles.pdfFileIcon,
                                                background: fileIconColors[((currentPage - 1) * PAGE_SIZE + index) % fileIconColors.length]
                                            }}
                                        >
                                            PDF
                                        </span>
                                        <div style={styles.fileTitleWrap}>
                                            <strong style={styles.fileTitle}>{manual.display_title}</strong>
                                            <span style={styles.fileSubTitle}>{manual.file_name}</span>
                                        </div>
                                    </div>

                                    <span style={styles.fileMutedText}>{formatDate(manual.updated_at || manual.created_at)}</span>
                                    <span style={styles.fileMutedText}>{formatFileSize(manual.file_size_kb)}</span>

                                    <div style={styles.accessCell}>
                                        <span
                                            style={{
                                                ...styles.versionBadge,
                                                ...(manual.version_type === 'Original'
                                                    ? styles.originalBadge
                                                    : styles.revisedBadge)
                                            }}
                                        >
                                            {manual.version_type}
                                        </span>
                                    </div>

                                    <div style={styles.fileActionCell}>
                                        <button
                                            type="button"
                                            style={styles.viewPdfButton}
                                            onClick={() => openPdf(manual)}
                                        >
                                            <i className="fa-solid fa-eye"></i>
                                            View PDF
                                        </button>
                                        <button type="button" style={styles.moreButton} aria-label="More options">
                                            {/* <i className="fa-solid fa-ellipsis"></i> */}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div style={styles.paginationBar}>
                            <span style={styles.paginationInfo}>
                                Showing {(currentPage - 1) * PAGE_SIZE + 1}
                                -
                                {Math.min(currentPage * PAGE_SIZE, displayedManuals.length)}
                                {' '}of {displayedManuals.length}
                            </span>

                            <div style={styles.paginationActions}>
                                <button
                                    type="button"
                                    style={{
                                        ...styles.paginationButton,
                                        ...(currentPage === 1 ? styles.paginationButtonDisabled : {})
                                    }}
                                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span style={styles.pageBadge}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    style={{
                                        ...styles.paginationButton,
                                        ...(currentPage === totalPages ? styles.paginationButtonDisabled : {})
                                    }}
                                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {selectedPdf && (
                <div style={styles.pdfOverlay} role="dialog" aria-modal="true" aria-label={selectedPdf.title}>
                    <div style={styles.pdfModal}>
                        <div style={styles.pdfHeader}>
                            <h2 style={styles.pdfTitle}>{selectedPdf.title}</h2>
                            <button
                                type="button"
                                style={styles.pdfCloseButton}
                                onClick={() => setSelectedPdf(null)}
                                aria-label="Close PDF viewer"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <iframe
                            title={selectedPdf.title}
                            src={selectedPdf.url}
                            style={styles.pdfFrame}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginTop: '18px',
        padding: '14px',
        border: '1px solid var(--app-border)',
        borderRadius: '6px',
        background: '#ffffff'
    },
    searchBox: {
        width: 'min(360px, 100%)',
        minHeight: '38px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 12px',
        border: '1px solid #cfd9e6',
        borderRadius: '6px',
        background: '#fbfdff',
        boxSizing: 'border-box'
    },
    searchIcon: {
        color: '#7a8799',
        fontSize: '13px'
    },
    searchInput: {
        width: '100%',
        minWidth: 0,
        border: 0,
        outline: 'none',
        background: 'transparent',
        color: '#07172d',
        fontSize: '13px',
        fontWeight: 700
    },
    filterGroup: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    filterButton: {
        minHeight: '34px',
        padding: '0 14px',
        border: '1px solid #cfd9e6',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#30425c',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 800
    },
    filterButtonActive: {
        borderColor: '#f97316',
        background: '#fff7ed',
        color: '#c2410c'
    },
    sortSelect: {
        minHeight: '34px',
        padding: '0 12px',
        border: '1px solid #cfd9e6',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#30425c',
        fontSize: '13px',
        fontWeight: 700
    },
    errorState: {
        flexDirection: 'column'
    },
    fileTable: {
        marginTop: '18px',
        border: '1px solid var(--app-border)',
        borderRadius: '8px',
        background: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 18px 44px rgba(10, 34, 64, 0.08)'
    },
    fileHeader: {
        minHeight: '48px',
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 1.8fr) minmax(140px, 0.8fr) minmax(100px, 0.55fr) minmax(110px, 0.65fr) minmax(150px, 0.8fr)',
        alignItems: 'center',
        gap: '18px',
        padding: '0 18px',
        borderBottom: '1px solid #edf1f7',
        color: '#7a8799',
        fontSize: '12px',
        fontWeight: 800,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    fileRows: {
        display: 'grid'
    },
    fileRow: {
        minHeight: '72px',
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 1.8fr) minmax(140px, 0.8fr) minmax(100px, 0.55fr) minmax(110px, 0.65fr) minmax(150px, 0.8fr)',
        alignItems: 'center',
        gap: '18px',
        padding: '0 18px',
        borderBottom: '1px solid #edf1f7',
        background: '#ffffff'
    },
    fileNameCell: {
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    pdfFileIcon: {
        width: '30px',
        height: '36px',
        display: 'grid',
        placeItems: 'center',
        flex: '0 0 auto',
        borderRadius: '4px',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 900
    },
    fileTitleWrap: {
        minWidth: 0,
        display: 'grid',
        gap: '4px'
    },
    fileTitle: {
        minWidth: 0,
        overflow: 'hidden',
        color: '#111827',
        fontSize: '14px',
        fontWeight: 900,
        lineHeight: 1.2,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    fileSubTitle: {
        minWidth: 0,
        overflow: 'hidden',
        color: '#8a97a8',
        fontSize: '11px',
        fontWeight: 700,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    fileMutedText: {
        minWidth: 0,
        overflow: 'hidden',
        color: '#6b7687',
        fontSize: '13px',
        fontWeight: 700,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    accessCell: {
        minWidth: 0,
        display: 'flex',
        alignItems: 'center'
    },
    versionBadge: {
        padding: '4px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 900
    },
    originalBadge: {
        background: '#eaf2ff',
        color: '#1d4ed8'
    },
    revisedBadge: {
        background: '#fff7ed',
        color: '#c2410c'
    },
    fileActionCell: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '10px'
    },
    viewPdfButton: {
        minHeight: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 14px',
        border: '0',
        borderRadius: '6px',
        background: '#eef2ff',
        color: '#1d4ed8',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 900
    },
    moreButton: {
        width: '32px',
        height: '32px',
        display: 'grid',
        placeItems: 'center',
        border: '0',
        borderRadius: '6px',
        background: 'transparent',
        color: '#111827',
        cursor: 'pointer',
        fontSize: '15px'
    },
    paginationBar: {
        minHeight: '58px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        padding: '0 18px',
        borderTop: '1px solid #edf1f7',
        background: '#fbfdff'
    },
    paginationInfo: {
        color: '#6b7687',
        fontSize: '13px',
        fontWeight: 800
    },
    paginationActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    paginationButton: {
        minHeight: '32px',
        padding: '0 12px',
        border: '1px solid #cfd9e6',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#30425c',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 900
    },
    paginationButtonDisabled: {
        cursor: 'not-allowed',
        opacity: 0.55
    },
    pageBadge: {
        minHeight: '32px',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0 10px',
        borderRadius: '6px',
        background: '#eef2ff',
        color: '#1d4ed8',
        fontSize: '13px',
        fontWeight: 900
    },
    pdfOverlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '22px',
        background: 'rgba(7, 23, 45, 0.72)'
    },
    pdfModal: {
        width: 'min(1120px, 96vw)',
        height: 'min(820px, 92vh)',
        display: 'grid',
        gridTemplateRows: '58px minmax(0, 1fr)',
        overflow: 'hidden',
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 28px 70px rgba(0, 0, 0, 0.32)'
    },
    pdfHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        padding: '0 16px',
        background: '#0a2240',
        color: '#ffffff'
    },
    pdfTitle: {
        minWidth: 0,
        margin: 0,
        overflow: 'hidden',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 900,
        lineHeight: 1.2,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    pdfCloseButton: {
        width: '36px',
        height: '36px',
        display: 'grid',
        placeItems: 'center',
        flex: '0 0 auto',
        border: 0,
        borderRadius: '6px',
        background: '#f97316',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '16px'
    },
    pdfFrame: {
        width: '100%',
        height: '100%',
        border: 0,
        background: '#f8fafc'
    }
};

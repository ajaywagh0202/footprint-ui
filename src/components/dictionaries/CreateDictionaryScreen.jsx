import { useEffect, useState } from 'react';
import SideBar from '../SideBar';
import '../../screen/DashboardScreen.css';
import '../../screen/MasterTableScreen.css';

const INITIAL_FORM = {
    department_code: '',
    display_title: '',
    version_type: 'Revised',
    revision_number: '',
    description: ''
};

const getBaseUrl = () => (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.BACKEND_URL ||
    'http://127.0.0.1:8000'
);

const getApiBaseUrl = () => {
    const baseUrl = getBaseUrl().endsWith('/') ? getBaseUrl().slice(0, -1) : getBaseUrl();

    return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const readArrayResponse = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    return [];
};

const toUploadFileName = (displayTitle, revisionNumber, versionType) => {
    const fileName = displayTitle
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    return `${fileName}_${revisionNumber || ''}_${versionType}.pdf`;
};

export default function CreateDictionaryScreen() {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [selectedFile, setSelectedFile] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [departmentError, setDepartmentError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [formResetKey, setFormResetKey] = useState(0);

    const loadDepartments = async () => {
        try {
            setLoadingDepartments(true);
            setDepartmentError('');

            const response = await fetch(`${getApiBaseUrl()}/manuals/departments/list`, {
                headers: {
                    accept: 'application/json'
                }
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.error || result?.detail || result?.message || 'Unable to load departments.');
            }

            const departmentList = readArrayResponse(result);
            setDepartments(departmentList);
            setFormData(prev => ({
                ...prev,
                department_code: prev.department_code || departmentList[0]?.department_code || ''
            }));
        } catch (error) {
            setDepartments([]);
            setDepartmentError(error?.message || 'Unable to load departments.');
        } finally {
            setLoadingDepartments(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSubmitMessage('');
        setSubmitError('');
    };

    const updateFile = (file) => {
        setSelectedFile(file || null);
        setSubmitMessage('');
        setSubmitError('');
    };

    const validatePdfFile = () => {
        if (!selectedFile) {
            return 'Please select a PDF file.';
        }

        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
            return 'Only PDF files are allowed.';
        }

        return '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.department_code || !formData.display_title || !formData.version_type) {
            setSubmitError('Please fill department, document title, and version type.');
            return;
        }

        const fileError = validatePdfFile();

        if (fileError) {
            setSubmitError(fileError);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError('');
            setSubmitMessage('');

            const uploadData = new FormData();
            uploadData.append('department_code', formData.department_code);
            uploadData.append('display_title', formData.display_title.trim());
            uploadData.append('version_type', formData.version_type);
            uploadData.append(
                'revision_number',
                formData.version_type === 'Revised' && formData.revision_number ? String(formData.revision_number) : ''
            );
            uploadData.append('description', formData.description.trim());
            uploadData.append('uploaded_by', localStorage.getItem('userName') || 'admin');
            uploadData.append(
                'file',
                selectedFile,
                toUploadFileName(formData.display_title, formData.version_type === 'Revised' ? formData.revision_number : '', formData.version_type)
            );

            const response = await fetch(`${getApiBaseUrl()}/manuals/upload`, {
                method: 'POST',
                body: uploadData
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.error || result?.detail || result?.message || 'Unable to create document.');
            }

            setSubmitMessage(result?.message || 'Document details saved successfully.');
            setFormData(INITIAL_FORM);
            setSelectedFile(null);
            setFormResetKey(key => key + 1);
            window.dispatchEvent(new CustomEvent('manuals:refresh', {
                detail: { department_code: formData.department_code }
            }));
            if (result?.data?.file_url) {
                window.open(result.data.file_url, '_blank');
            }
        } catch (error) {
            setSubmitError(error?.message || 'Unable to create document.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dashboard-shell">
            <SideBar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Add Document</h1>
                        <p>Create manual metadata for a selected department.</p>
                    </div>
                </header>

                <section style={styles.formShell}>

                    <form key={formResetKey} style={styles.formGrid} onSubmit={handleSubmit}>
                        <label style={styles.field}>
                            <span style={styles.labelText}>Department</span>
                            <select
                                value={formData.department_code}
                                onChange={(event) => updateField('department_code', event.target.value)}
                                style={styles.input}
                                disabled={loadingDepartments}
                                required
                            >
                                <option value="">{loadingDepartments ? 'Loading departments...' : 'Select department'}</option>
                                {departments.map(department => (
                                    <option key={department.id || department.department_code} value={department.department_code}>
                                        {department.department_name} ({department.department_code})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={styles.field}>
                            <span style={styles.labelText}>Display Title</span>
                            <input
                                type="text"
                                value={formData.display_title}
                                onChange={(event) => updateField('display_title', event.target.value)}
                                style={styles.input}
                                placeholder="General Rule"
                                required
                            />
                        </label>

                        <label style={styles.field}>
                            <span style={styles.labelText}>Version Type</span>
                            <select
                                value={formData.version_type}
                                onChange={(event) => {
                                    const versionType = event.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        version_type: versionType,
                                        revision_number: versionType === 'Original' ? '' : prev.revision_number
                                    }));
                                    setSubmitMessage('');
                                    setSubmitError('');
                                }}
                                style={styles.input}
                                required
                            >
                                <option value="Original">Original</option>
                                <option value="Revised">Revised</option>
                            </select>
                        </label>

                        <label style={styles.field}>
                            <span style={styles.labelText}>Revision Number</span>
                            <input
                                type="number"
                                min="0"
                                value={formData.revision_number}
                                onChange={(event) => updateField('revision_number', event.target.value)}
                                style={{
                                    ...styles.input,
                                    ...(formData.version_type === 'Original' ? styles.inputDisabled : {})
                                }}
                                placeholder="1"
                                disabled={formData.version_type === 'Original'}
                            />
                        </label>

                        <label style={{ ...styles.field, ...styles.fullWidth }}>
                            <span style={styles.labelText}>Description</span>
                            <textarea
                                value={formData.description}
                                onChange={(event) => updateField('description', event.target.value)}
                                style={{ ...styles.input, ...styles.textarea }}
                                placeholder="Commercial department revised general rule manual"
                            />
                        </label>

                        <label style={{ ...styles.field, ...styles.fullWidth }}>
                            <span style={styles.labelText}>PDF File</span>
                            <input
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={(event) => updateFile(event.target.files?.[0])}
                                style={styles.fileInput}
                                required
                            />
                            {selectedFile && (
                                <span style={styles.fileHint}>
                                    Selected: {selectedFile.name}
                                    {' '}| Upload name: {toUploadFileName(formData.display_title, formData.version_type === 'Revised' ? formData.revision_number : '', formData.version_type)}
                                </span>
                            )}
                        </label>

                        {departmentError && (
                            <div style={{ ...styles.notice, ...styles.errorNotice }}>
                                {departmentError}
                                <button type="button" style={styles.inlineRetryButton} onClick={loadDepartments}>
                                    Retry
                                </button>
                            </div>
                        )}

                        {submitError && (
                            <div style={{ ...styles.notice, ...styles.errorNotice }}>{submitError}</div>
                        )}

                        {submitMessage && (
                            <div style={{ ...styles.notice, ...styles.successNotice }}>{submitMessage}</div>
                        )}

                        <div style={styles.actions}>
                            <button
                                type="button"
                                style={styles.secondaryButton}
                                onClick={() => {
                                    setFormData(INITIAL_FORM);
                                    setSelectedFile(null);
                                    setFormResetKey(key => key + 1);
                                }}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                style={styles.primaryButton}
                                disabled={submitting || loadingDepartments}
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                                {submitting ? 'Submitting...' : 'Submit Document'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

const styles = {
    formShell: {
        marginTop: '22px',
        padding: '22px',
        border: '1px solid var(--app-border)',
        borderRadius: '8px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
        boxShadow: '0 20px 46px rgba(10, 34, 64, 0.10)'
    },
    formIntro: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        paddingBottom: '18px',
        borderBottom: '1px solid #e3e9f2'
    },
    formIcon: {
        width: '54px',
        height: '54px',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '8px',
        background: '#fff7ed',
        color: '#178236',
        fontSize: '24px'
    },
    formTitle: {
        margin: 0,
        color: '#07172d',
        fontSize: '22px',
        fontWeight: 900
    },
    formSubtitle: {
        margin: '5px 0 0',
        color: '#53657f',
        fontSize: '14px',
        fontWeight: 700
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '16px',
        marginTop: '20px'
    },
    field: {
        minWidth: 0,
        display: 'grid',
        gap: '8px'
    },
    fullWidth: {
        gridColumn: '1 / -1'
    },
    labelText: {
        color: '#30425c',
        fontSize: '13px',
        fontWeight: 900
    },
    input: {
        width: '100%',
        minHeight: '42px',
        padding: '0 12px',
        border: '1px solid #cfd9e6',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#07172d',
        fontSize: '14px',
        fontWeight: 700,
        boxSizing: 'border-box'
    },
    inputDisabled: {
        background: '#eef2f7',
        color: '#8a97a8',
        cursor: 'not-allowed'
    },
    textarea: {
        minHeight: '112px',
        padding: '12px',
        resize: 'vertical',
        lineHeight: 1.45
    },
    fileInput: {
        width: '100%',
        minHeight: '46px',
        padding: '10px 12px',
        border: '1px dashed #178236',
        borderRadius: '6px',
        background: '#fff7ed',
        color: '#07172d',
        fontSize: '14px',
        fontWeight: 800,
        boxSizing: 'border-box',
        cursor: 'pointer'
    },
    fileHint: {
        color: '#53657f',
        fontSize: '12px',
        fontWeight: 800
    },
    notice: {
        gridColumn: '1 / -1',
        minHeight: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '0 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 900
    },
    errorNotice: {
        border: '1px solid #fecaca',
        background: '#fff1f2',
        color: '#b91c1c'
    },
    successNotice: {
        border: '1px solid #bbf7d0',
        background: '#f0fdf4',
        color: '#15803d'
    },
    inlineRetryButton: {
        minHeight: '30px',
        padding: '0 10px',
        border: '0',
        borderRadius: '6px',
        background: '#178236',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 900
    },
    actions: {
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '4px'
    },
    secondaryButton: {
        minHeight: '40px',
        padding: '0 16px',
        border: '1px solid #cfd9e6',
        borderRadius: '6px',
        background: '#ffffff',
        color: '#30425c',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 900
    },
    primaryButton: {
        minHeight: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 18px',
        border: '0',
        borderRadius: '6px',
        background: '#178236',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 900
    }
};

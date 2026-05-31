import { useEffect, useMemo, useState } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { getTableData } from './tableApi';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ZoneTable({ onClose }) {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const columnDefs = useMemo(() => [
        { field: 'zone', headerName: 'Zone Name', flex: 2 },
        { field: 'zone_code', headerName: 'Code', flex: 1 },
        { field: 'headquarter', headerName: 'Headquarter', flex: 1 },
        { field: 'region', headerName: 'Region', flex: 1 }
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
        minWidth: 120
    }), []);

    useEffect(() => {
        let isMounted = true;

        const loadZones = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await getTableData('/zones/');

                if (isMounted) {
                    setRowData(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err?.response?.data?.detail || err?.message || 'Unable to load zones.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadZones();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section className="master-table-panel">
            <div className="table-header-bar">
                <div className="table-header-left">
                    <i className="fa-solid fa-map"></i>
                    <h2>Zone Master</h2>
                    <span className="row-count">{rowData.length} records</span>
                </div>
                <button className="table-close-btn" type="button" onClick={onClose}>
                    <i className="fas fa-times"></i> Close
                </button>
            </div>

            {loading && (
                <div className="table-state">
                    <span className="loading-spinner" aria-hidden="true"></span>
                    <span>Loading zones</span>
                </div>
            )}

            {!loading && error && (
                <div className="table-state error-state">{error}</div>
            )}

            {!loading && !error && (
                <div className="ag-theme-alpine master-grid">
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        pagination
                        paginationPageSize={20}
                        animateRows
                        enableCellTextSelection
                    />
                </div>
            )}
        </section>
    );
}

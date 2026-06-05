import { useEffect, useMemo, useState } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { getTableData } from './tableApi';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function StationTable({ onClose }) {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const columnDefs = useMemo(() => [
        { field: 'station', headerName: 'Station Name', flex: 2 },
        { field: 'station_code', headerName: 'Station Code', flex: 1 },
        { field: 'station_category', headerName: 'Category', flex: 1 },
        { field: 'division_name', headerName: 'Division', flex: 1 },
        { field: 'zone_name', headerName: 'Zone', flex: 1 },
        { field: 'district', headerName: 'District', flex: 1 },
        { field: 'state', headerName: 'State', flex: 1 }
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

        const loadStations = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await getTableData('/stations');

                if (isMounted) {
                    setRowData(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err?.response?.data?.detail || err?.message || 'Unable to load stations.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadStations();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section className="master-table-panel">
            <div className="table-header-bar">
                <div className="table-header-left">
                    <i className="fa-solid fa-map-location-dot"></i>
                    <h2>Station Master</h2>
                    <span className="row-count">{rowData.length} records</span>
                </div>
                <button className="table-close-btn" type="button" onClick={onClose}>
                    <i className="fas fa-times"></i> Close
                </button>
            </div>

            {loading && (
                <div className="table-state">
                    <span className="loading-spinner" aria-hidden="true"></span>
                    <span>Loading stations</span>
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
                        paginationPageSize={50}
                        animateRows
                        enableCellTextSelection
                    />
                </div>
            )}
        </section>
    );
}

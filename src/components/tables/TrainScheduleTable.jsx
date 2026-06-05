import { useEffect, useMemo, useState } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { getTableData } from './tableApi';
import { themeBalham } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const formatTime = (params) => {
    const value = params.value;

    if (!value) {
        return '';
    }

    const text = String(value);
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);

    if (timeMatch) {
        return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }

    return text;
};

export default function TrainScheduleTable({ onClose }) {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const columnDefs = useMemo(() => [
        { field: 'train_no', headerName: 'Train Number', flex: 1 },
        { field: 'train_name', headerName: 'Train Name', flex: 1 },
        { field: 'station_name', headerName: 'Station Name', flex: 1 },
        { field: 'arrival_time', headerName: 'Arrival Time', flex: 1, valueFormatter: formatTime },
        { field: 'departure_time', headerName: 'Departure Time', flex: 1, valueFormatter: formatTime },
        { field: 'distance' , headerName: 'Distance (km)', flex: 1 },
        { field: 'from_station_name', headerName: 'From Station', flex: 1 },
        { field: 'from_station_code', headerName: 'From Station Code', flex: 1 },
        { field: 'to_station_name', headerName: 'To Station', flex: 1 },
        { field: 'to_station_code', headerName: 'To Station Code', flex: 1 }
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
        minWidth: 120,
    }), []);

    useEffect(() => {
        let isMounted = true;

        const loadTrainSchedules = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await getTableData('/train-schedules/');

                if (isMounted) {
                    setRowData(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err?.response?.data?.detail || err?.message || 'Unable to load train schedules.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadTrainSchedules();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section className="master-table-panel">
            <div className="table-header-bar">
                <div className="table-header-left">
                    <i className="fa-solid fa-calendar-days"></i>
                    <h2>Train Schedule</h2>
                    <span className="row-count">{rowData.length} records</span>
                </div>
                <button className="table-close-btn" type="button" onClick={onClose}>
                    <i className="fas fa-times"></i> Close
                </button>
            </div>

            {loading && (
                <div className="table-state">
                    <span className="loading-spinner" aria-hidden="true"></span>
                    <span>Loading train schedules</span>
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

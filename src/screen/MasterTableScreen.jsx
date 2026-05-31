
import { useState } from 'react';
import SideBar from '../components/SideBar';
import ZoneTable from '../components/tables/ZoneTable';
import DivisionTable from '../components/tables/DivisionTable';
import StationTable from '../components/tables/StationTable';
import './DashboardScreen.css';
import './MasterTableScreen.css';

const masterCards = [
    {
        key: 'zone',
        label: 'Zone Master',
        sub: 'Manage Railway Zones',
        icon: 'fa-solid fa-map',
        color: '#2D9966',
        enabled: true
    },
    {
        key: 'division',
        label: 'Division Master',
        sub: 'Manage Railway Divisions',
        icon: 'fa-solid fa-code-branch',
        color: '#615FFF',
        enabled: true
    },
    {
        key: 'station',
        label: 'Station Master',
        sub: 'Manage Railway Stations',
        icon: 'fa-solid fa-building-train',
        color: '#F59E0B',
        enabled: true
    },
    {
        key: 'employee',
        label: 'Employee Master',
        sub: 'Coming Soon',
        icon: 'fa-solid fa-users',
        color: '#9CA3AF',
        enabled: false
    }
];

export default function MasterTableScreen() {
    const [activeTable, setActiveTable] = useState(null);

    return (
        <div className="dashboard-shell">
            <SideBar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Master Table</h1>
                    </div>
                </header>

                {activeTable === null && (
                    <section className="master-cards-grid" aria-label="Railway data master modules">
                        {masterCards.map((card) => (
                            <button
                                key={card.key}
                                type="button"
                                className={`master-card ${card.enabled ? '' : 'disabled'}`}
                                style={{ '--master-card-color': card.color }}
                                onClick={() => card.enabled && setActiveTable(card.key)}
                                disabled={!card.enabled}
                            >
                                <span className="master-card-icon">
                                    <i className={card.icon}></i>
                                </span>
                                <span className="master-card-content">
                                    <span className="master-card-title">{card.label}</span>
                                    <span className="master-card-subtitle">{card.sub}</span>
                                </span>
                                {!card.enabled && <span className="coming-soon-badge">Coming Soon</span>}
                            </button>
                        ))}
                    </section>
                )}

                {activeTable === 'zone' && (
                    <ZoneTable onClose={() => setActiveTable(null)} />
                )}

                {activeTable === 'division' && (
                    <DivisionTable onClose={() => setActiveTable(null)} />
                )}

                {activeTable === 'station' && (
                    <StationTable onClose={() => setActiveTable(null)} />
                )}
            </main>
        </div>
    );
}

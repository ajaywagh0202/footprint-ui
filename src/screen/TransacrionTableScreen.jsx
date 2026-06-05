
import { useState } from 'react';
import SideBar from '../components/SideBar';
import TrainScheduleTable from '../components/tables/TrainScheduleTable';
import './DashboardScreen.css';
import './MasterTableScreen.css';

const transactionCards = [
    {
        key: 'train_schedule',
        label: 'Train Schedule',
        sub: 'Manage Train Schedules',
        icon: 'fa-solid fa-map',
        color: '#2D9966',
        enabled: true
    },
];

export default function TransactionTableScreen() {
    const [activeTable, setActiveTable] = useState(null);

    return (
        <div className="dashboard-shell">
            <SideBar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Transaction Dashboard</h1>
                    </div>
                </header>

                {activeTable === null && (
                    <section className="master-cards-grid" aria-label="Railway data master modules">
                        {transactionCards.map((card) => (
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

                {activeTable === 'train_schedule' && (
                    <TrainScheduleTable onClose={() => setActiveTable(null)} />
                )}
            </main>
        </div>
    );
}

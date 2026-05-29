
import SideBar from '../components/SideBar';
import './DashboardScreen.css';

export default function DashboardScreen() {
    return (
        <div className="dashboard-shell">
            <SideBar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                    </div>
                </header>

            </main>
        </div>
    );
}

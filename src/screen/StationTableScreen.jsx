import { useNavigate } from 'react-router-dom';
import SideBar from '../components/SideBar';
import StationTable from '../components/tables/StationTable';
import './DashboardScreen.css';
import './MasterTableScreen.css';

export default function StationTableScreen() {
    const navigate = useNavigate();

    return (
        <div className="dashboard-shell">
            <SideBar />

            <main className="dashboard-main">
                <StationTable onClose={() => navigate('/station')} />
            </main>
        </div>
    );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import DigitalTwin from './pages/DigitalTwin';
import AIInsights from './pages/AIInsights';
import EmergencyControl from './pages/EmergencyControl';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Weather from './pages/Weather';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/digital-twin" element={<DigitalTwin />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/emergency" element={<EmergencyControl />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;

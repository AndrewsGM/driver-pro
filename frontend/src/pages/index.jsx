import Layout from "./Layout.jsx";

import AICoach from "./AICoach";

import AdminPanel from "./AdminPanel";

import Dashboard from "./Dashboard";

import History from "./History";

import Ranking from "./Ranking";

import Session from "./Session";

import Settings from "./Settings";

import Simulation from "./Simulation";

import Subscription from "./Subscription";

import TheoreticalExam from "./TheoreticalExam";

import Theory from "./Theory";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AICoach: AICoach,
    
    AdminPanel: AdminPanel,
    
    Dashboard: Dashboard,
    
    History: History,
    
    Ranking: Ranking,
    
    Session: Session,
    
    Settings: Settings,
    
    Simulation: Simulation,
    
    Subscription: Subscription,
    
    TheoreticalExam: TheoreticalExam,
    
    Theory: Theory,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AICoach />} />
                
                
                <Route path="/AICoach" element={<AICoach />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/History" element={<History />} />
                
                <Route path="/Ranking" element={<Ranking />} />
                
                <Route path="/Session" element={<Session />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Simulation" element={<Simulation />} />
                
                <Route path="/Subscription" element={<Subscription />} />
                
                <Route path="/TheoreticalExam" element={<TheoreticalExam />} />
                
                <Route path="/Theory" element={<Theory />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
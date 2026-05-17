import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MerchantDashboardView } from './views/MerchantDashboardView';
// import { MerchantSidebar } from './components/MerchantSidebar';

const MerchantApp = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* <MerchantSidebar /> */}

            <main className="flex-1 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<MerchantDashboardView />} />
                    {/* <Route path="/campaigns" element={<MerchantCampaignsView />} /> */}
                    {/* <Route path="/settings" element={<MerchantSettingsView />} /> */}
                </Routes>
            </main>
        </div>
    );
};

export default MerchantApp;
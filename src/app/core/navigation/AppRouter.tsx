import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import {CustomerApp} from "@/app/features/customer/presentation/views/CustomerApp.tsx";
import {MerchantApp} from "@/app/features/merchant/presentation/views/MerchantApp.tsx";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/customer/*" element={<CustomerApp onSwitchRole={function(): void {
                    throw new Error("Function not implemented.");
                } } />} />
                <Route path="/merchant/*" element={<MerchantApp onSwitchRole={function(): void {
                    throw new Error("Function not implemented.");
                } } />} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/customer" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
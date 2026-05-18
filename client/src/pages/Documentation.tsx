import React from 'react';

export default function Documentation() {
    return (
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#5D4037', marginBottom: '20px' }}>Documentation</h1>
            <p style={{ color: '#555', lineHeight: '1.6' }}>
                Welcome to the BakeryERP Documentation. <br /><br />
                <strong>1. Dashboard:</strong> View your daily summaries and quick stats here.<br />
                <strong>2. Products:</strong> Manage your bakery items, add new cakes, breads, etc.<br />
                <strong>3. Orders:</strong> Track customer orders from pending to completed.<br />
                <strong>4. Inventory:</strong> Keep track of your raw materials like flour, sugar, and butter.
            </p>
        </div>
    );
}
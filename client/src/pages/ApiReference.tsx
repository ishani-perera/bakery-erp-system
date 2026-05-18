export default function ApiReference() {
    return (
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#5D4037', marginBottom: '20px' }}>API Reference</h1>
            <p style={{ color: '#555', lineHeight: '1.6' }}>
                BakeryERP provides a RESTful API for integration. <br /><br />
                <strong>Authentication:</strong> Use Bearer Token in headers.<br />
                <strong>Endpoints:</strong><br />
                - GET /api/products : Fetch all products<br />
                - POST /api/orders : Create a new order
            </p>
        </div>
    );
}
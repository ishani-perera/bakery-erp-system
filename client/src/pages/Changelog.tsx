export default function Changelog() {
    return (
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#5D4037', marginBottom: '20px' }}>Changelog</h1>
            <div style={{ color: '#555', lineHeight: '1.6' }}>
                <h3 style={{ color: '#333' }}>v1.0.0 - Initial Release</h3>
                <ul>
                    <li>Added basic dashboard functionalities.</li>
                    <li>Implemented inventory tracking.</li>
                    <li>Added user login and authentication.</li>
                </ul>
            </div>
        </div>
    );
}
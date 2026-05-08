import React from 'react';

const ReportPlaceholder = ({ title, data, formatCurrency }) => {
  return (
    <div className="report-placeholder" style={{ padding: '20px' }}>
      <h2>{title}</h2>
      {data ? (
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default ReportPlaceholder;

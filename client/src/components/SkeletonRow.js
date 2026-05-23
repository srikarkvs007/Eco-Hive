import React from 'react';

const SkeletonRow = () => {
    return (
        <div className="d-flex align-items-center p-4 border-bottom w-100" style={{ gap: '20px', pointerEvents: 'none' }}>
            <div className="skeleton-block" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }}></div>
            <div className="d-flex flex-column flex-grow-1" style={{ gap: '8px' }}>
                <div className="skeleton-block" style={{ height: '18px', width: '40%', borderRadius: '4px' }}></div>
                <div className="skeleton-block" style={{ height: '14px', width: '60%', borderRadius: '4px' }}></div>
            </div>
            <div className="skeleton-block" style={{ height: '36px', width: '90px', borderRadius: '20px', flexShrink: 0 }}></div>
        </div>
    );
};

export default SkeletonRow;

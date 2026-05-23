import React from 'react';

const SkeletonProductCard = () => {
    return (
        <div className="glass-card-premium d-flex flex-column" style={{ height: '100%', padding: '0', pointerEvents: 'none' }}>
            {/* Image Skeleton - fills top 60% approx, now uses aspect-portrait */}
            <div className="skeleton-block w-100 aspect-portrait" style={{ borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}></div>
            
            {/* Content Skeleton */}
            <div className="card-body d-flex flex-column p-4 w-100 flex-grow-1">
                <div className="skeleton-block mb-3" style={{ height: '24px', width: '80%', borderRadius: '4px' }}></div>
                <div className="skeleton-block mb-2" style={{ height: '14px', width: '100%', borderRadius: '4px' }}></div>
                <div className="skeleton-block mb-4" style={{ height: '14px', width: '60%', borderRadius: '4px' }}></div>
                
                <div className="mt-auto d-flex justify-content-between align-items-end" style={{ borderTop: 'var(--glass-border)', paddingTop: '16px' }}>
                    <div className="w-100">
                        <div className="skeleton-block mb-1" style={{ height: '10px', width: '40px', borderRadius: '4px' }}></div>
                        <div className="skeleton-block" style={{ height: '28px', width: '80px', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonProductCard;

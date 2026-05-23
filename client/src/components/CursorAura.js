import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CursorAura = () => {
    const [isVisible, setIsVisible] = useState(false);
    
    // Spring config creates the precise 120ms lag lag "alive" feeling
    const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
    const cursorX = useSpring(-150, springConfig);
    const cursorY = useSpring(-150, springConfig);

    useEffect(() => {
        // Disable on touch devices
        if (window.matchMedia("(pointer: coarse)").matches) {
            return;
        }

        const moveCursor = (e) => {
            cursorX.set(e.clientX - 150); // offset by half width (300px)
            cursorY.set(e.clientY - 150);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [cursorX, cursorY, isVisible]);

    return (
        <motion.div
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--accent-glow) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none',
                zIndex: 9999,
                x: cursorX,
                y: cursorY,
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease',
                mixBlendMode: 'screen'
            }}
        />
    );
};

export default CursorAura;

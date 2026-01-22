import React, { useRef, useState, useEffect } from 'react';

const InteractiveHeroImage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const box = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - box.left;
        const y = clientY - box.top;

        const centerX = box.width / 2;
        const centerY = box.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10 degrees
        const rotateY = ((x - centerX) / centerX) * 10;

        setRotation({ x: rotateX, y: rotateY });
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        setIsHovering(false);
    };

    return (
        <div
            className="relative w-full max-w-4xl mx-auto my-12 perspective-1000"
            style={{ perspective: '1000px' }}
        >
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseLeave}
                className="relative w-full aspect-[16/9] transition-transform duration-300 ease-out preserve-3d cursor-pointer"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
                }}
            >
                {/* Glow behind */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full scale-90 translate-z-[-50px]"
                    style={{ transform: 'translateZ(-50px)' }} />

                {/* Main Image */}
                <img
                    src="/assets/landing_hero_3d_v2.png"
                    alt="Crypto Analytics Dashboard 3D"
                    className="w-full h-full object-contain drop-shadow-2xl rounded-3xl"
                    draggable="false"
                />

                {/* Shine effect overlay */}
                <div
                    className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity duration-300"
                    style={{ opacity: isHovering ? 0.3 : 0 }}
                />
            </div>
        </div>
    );
};

export default InteractiveHeroImage;

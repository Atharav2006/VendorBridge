import React, { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(153, 188, 133, 0.25)'; // Moss Green tint
        ctx.fill();
      }
    }

    const particleCount = Math.min(80, Math.floor((width * height) / 20000));
    const particles = Array.from({ length: particleCount }, () => new Particle());

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      // Clear with very subtle transparency to show trails if desired, or completely clear
      ctx.clearRect(0, 0, width, height);

      // Draw background noise / mesh line connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(153, 188, 133, ${0.15 * (1 - dist / 100)})`; // Green links
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Canvas Particle Network */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Floating ambient gradient shapes */}
      <div className="absolute top-[10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-primary/10 blur-[120px] animate-float" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-secondary/10 blur-[120px] animate-float-delayed" />
      <div className="absolute top-[50%] left-[45%] w-[15vw] h-[15vw] rounded-full bg-accent/5 blur-[90px] animate-pulse-slow" />
    </div>
  );
};
export default ParticleBackground;

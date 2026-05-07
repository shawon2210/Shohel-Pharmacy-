import React, { useEffect, useRef } from 'react';
import './Background3D.css';

const Background3D = ({ className = '', variant = 'medical' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (variant !== 'medical') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class MedicalParticle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.size = Math.random() * 30 + 15;
        this.speedY = Math.random() * 0.3 + 0.1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.type = Math.floor(Math.random() * 4); // 0: pill, 1: capsule, 2: tablet, 3: bottle
        this.color = this.getColor();
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      getColor() {
        const colors = [
          { r: 147, g: 197, b: 253 }, // Light blue
          { r: 134, g: 239, b: 172 }, // Light green
          { r: 196, g: 181, b: 253 }, // Light purple
          { r: 255, g: 255, b: 255 }, // White
          { r: 165, g: 243, b: 252 }, // Light cyan
          { r: 167, g: 243, b: 208 }, // Light mint
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 50) {
          this.reset();
        }

        if (this.x < -50 || this.x > canvas.width + 50) {
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        const { r, g, b } = this.color;
        const gradient = ctx.createLinearGradient(-this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);

        switch (this.type) {
          case 0: // Pill (capsule shape)
            this.drawPill(gradient);
            break;
          case 1: // Capsule (two-tone)
            this.drawCapsule(gradient, r, g, b);
            break;
          case 2: // Round tablet
            this.drawTablet(gradient);
            break;
          case 3: // Medicine bottle
            this.drawBottle(gradient);
            break;
          default:
            this.drawPill(gradient);
            break;
        }

        ctx.restore();
      }

      drawPill(gradient) {
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(-this.size / 4, 0, this.size / 3, Math.PI / 2, -Math.PI / 2);
        ctx.lineTo(this.size / 4, -this.size / 3);
        ctx.arc(this.size / 4, 0, this.size / 3, -Math.PI / 2, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
        
        // Highlight
        ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      drawCapsule(gradient, r, g, b) {
        // Left half
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(-this.size / 6, 0, this.size / 3, Math.PI / 2, -Math.PI / 2);
        ctx.lineTo(0, -this.size / 3);
        ctx.lineTo(0, this.size / 3);
        ctx.closePath();
        ctx.fill();

        // Right half (slightly different color)
        const gradient2 = ctx.createLinearGradient(0, -this.size / 2, this.size / 2, this.size / 2);
        gradient2.addColorStop(0, `rgba(${r + 30}, ${g + 30}, ${b + 30}, 0.4)`);
        gradient2.addColorStop(1, `rgba(${r + 30}, ${g + 30}, ${b + 30}, 0.1)`);
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 3);
        ctx.lineTo(this.size / 6, -this.size / 3);
        ctx.arc(this.size / 6, 0, this.size / 3, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(0, this.size / 3);
        ctx.closePath();
        ctx.fill();

        // Divider line
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 3);
        ctx.lineTo(0, this.size / 3);
        ctx.stroke();
      }

      drawTablet(gradient) {
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Cross line
        ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size / 5, 0);
        ctx.lineTo(this.size / 5, 0);
        ctx.stroke();
      }

      drawBottle(gradient) {
        const width = this.size / 2;
        const height = this.size;

        ctx.fillStyle = gradient;
        
        // Bottle cap
        ctx.fillRect(-width / 3, -height / 2, width * 0.66, height * 0.2);
        
        // Bottle body
        ctx.beginPath();
        ctx.moveTo(-width / 2, -height / 3);
        ctx.lineTo(-width / 2, height / 3);
        ctx.quadraticCurveTo(-width / 2, height / 2, -width / 3, height / 2);
        ctx.lineTo(width / 3, height / 2);
        ctx.quadraticCurveTo(width / 2, height / 2, width / 2, height / 3);
        ctx.lineTo(width / 2, -height / 3);
        ctx.closePath();
        ctx.fill();

        // Bottle highlight
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.fillRect(-width / 2.5, -height / 4, width * 0.2, height * 0.4);
      }
    }

    const init = () => {
      resizeCanvas();
      particles = [];
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 30);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new MedicalParticle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  return (
    <div className={`background-3d medical-background ${className}`}>
      {/* Pastel gradient background */}
      <div className="gradient-overlay" />
      
      {/* Animated canvas for floating medical items */}
      {variant === 'medical' && (
        <canvas
          ref={canvasRef}
          className="medical-canvas"
        />
      )}
      
      {/* Additional blur layers for depth */}
      <div className="blur-layer blur-layer-1" />
      <div className="blur-layer blur-layer-2" />
      <div className="blur-layer blur-layer-3" />
    </div>
  );
};

export default Background3D;
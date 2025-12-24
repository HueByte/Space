import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './PointCloud.css';

interface PointCloudProps {
  particleCount?: number;
  color?: string;
  secondaryColor?: string;
}

export function PointCloud({
  particleCount = 3000,
  color = '#fd0069',
  secondaryColor = '#8234c9',
}: PointCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create sprites (billboarded squares) that always face camera
    const allSprites: THREE.Sprite[] = [];
    const primaryColor = new THREE.Color(color);
    const secondary = new THREE.Color(secondaryColor);

    // Create a canvas texture for the square
    const createSquareTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const squareTexture = createSquareTexture();

    // Helper to create a billboarded square sprite
    const createSquare = (size: number, colorMix: number) => {
      const mixedColor = primaryColor.clone().lerp(secondary, colorMix);
      const material = new THREE.SpriteMaterial({
        map: squareTexture,
        color: mixedColor,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.3,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(size, size, 1);
      allSprites.push(sprite);
      return sprite;
    };

    // Formation 1: Spiral tower
    const spiralGroup = new THREE.Group();
    for (let i = 0; i < 80; i++) {
      const angle = i * 0.3;
      const y = (i - 40) * 0.08;
      const radius = 1.5 + Math.sin(i * 0.1) * 0.5;

      const square = createSquare(0.15 + Math.random() * 0.1, i / 80);
      square.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      spiralGroup.add(square);
    }
    spiralGroup.position.set(-3, 0, 0);
    scene.add(spiralGroup);

    // Formation 2: Floating cube grid
    const cubeGroup = new THREE.Group();
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          if (Math.random() > 0.6) {
            const square = createSquare(0.12, Math.random());
            square.position.set(x * 0.4, y * 0.4, z * 0.4);
            cubeGroup.add(square);
          }
        }
      }
    }
    cubeGroup.position.set(3, 0.5, -1);
    scene.add(cubeGroup);

    // Formation 3: Orbital rings
    const ringGroup = new THREE.Group();
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = 1.2 + ring * 0.5;
      const squaresInRing = 20 + ring * 10;
      for (let i = 0; i < squaresInRing; i++) {
        const angle = (i / squaresInRing) * Math.PI * 2;
        const square = createSquare(0.08 + ring * 0.02, ring / 3);
        square.position.set(
          Math.cos(angle) * ringRadius,
          Math.sin(angle) * ringRadius * 0.3,
          Math.sin(angle) * ringRadius
        );
        ringGroup.add(square);
      }
    }
    ringGroup.position.set(0, -1, 2);
    scene.add(ringGroup);

    // Formation 4: Scattered constellation
    const constellationGroup = new THREE.Group();
    for (let i = 0; i < particleCount / 10; i++) {
      const square = createSquare(0.03 + Math.random() * 0.06, Math.random());
      square.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 3
      );
      constellationGroup.add(square);
    }
    scene.add(constellationGroup);

    // Formation 5: DNA-like helix
    const helixGroup = new THREE.Group();
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      const angle1 = t * Math.PI * 4;
      const angle2 = angle1 + Math.PI;
      const y = (t - 0.5) * 6;
      const radius = 0.8;

      const square1 = createSquare(0.1, t);
      square1.position.set(Math.cos(angle1) * radius, y, Math.sin(angle1) * radius);
      helixGroup.add(square1);

      const square2 = createSquare(0.1, 1 - t);
      square2.position.set(Math.cos(angle2) * radius, y, Math.sin(angle2) * radius);
      helixGroup.add(square2);

      // Connecting bars (small squares along the connection)
      if (i % 5 === 0) {
        for (let j = 0; j < 3; j++) {
          const barSquare = createSquare(0.04, 0.5);
          const lerpT = (j + 1) / 4;
          barSquare.position.set(
            Math.cos(angle1) * radius * (1 - lerpT) + Math.cos(angle2) * radius * lerpT,
            y,
            Math.sin(angle1) * radius * (1 - lerpT) + Math.sin(angle2) * radius * lerpT
          );
          helixGroup.add(barSquare);
        }
      }
    }
    helixGroup.position.set(5, 0, -2);
    helixGroup.rotation.z = 0.3;
    scene.add(helixGroup);

    // Mouse interaction
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const onMouseMove = (event: MouseEvent) => {
      mouse.targetX = (event.clientX / width - 0.5) * 2;
      mouse.targetY = -(event.clientY / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse following
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Animate each formation differently
      spiralGroup.rotation.y = elapsedTime * 0.2 + mouse.x * 0.3;
      spiralGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1 + mouse.y * 0.1;

      cubeGroup.rotation.x = elapsedTime * 0.15 + mouse.y * 0.2;
      cubeGroup.rotation.y = elapsedTime * 0.1 + mouse.x * 0.2;

      ringGroup.rotation.x = Math.PI * 0.3 + Math.sin(elapsedTime * 0.5) * 0.2;
      ringGroup.rotation.y = elapsedTime * 0.3;
      ringGroup.rotation.z = mouse.x * 0.1;

      constellationGroup.rotation.y = elapsedTime * 0.02 + mouse.x * 0.1;
      constellationGroup.rotation.x = mouse.y * 0.05;

      helixGroup.rotation.y = elapsedTime * 0.25;
      helixGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.3;

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      container.removeChild(renderer.domElement);
      squareTexture.dispose();
      allSprites.forEach(sprite => {
        sprite.material.dispose();
      });
      renderer.dispose();
    };
  }, [particleCount, color, secondaryColor]);

  return <div ref={containerRef} className="point-cloud" />;
}

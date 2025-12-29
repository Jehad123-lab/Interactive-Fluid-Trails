
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { 
    baseVertexShader, 
    advectionShader, 
    splatShader, 
    divergenceShader, 
    pressureShader, 
    gradientSubtractShader, 
    displayShader 
} from './shaders';

interface FluidConfig {
    densityDissipation: number;
    velocityDissipation: number;
    splatRadius: number;
    sizingMode?: 'CLAMP' | 'CONTAIN' | 'COVER';
}

interface FluidCanvasProps {
    config: FluidConfig;
    onLog: (msg: string) => void;
    variant: number;
}

const FluidCanvas: React.FC<FluidCanvasProps> = ({ config, onLog, variant }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const configRef = useRef(config);
    const variantRef = useRef(variant);

    // Refs to store textures
    const imageTextureRef = useRef<THREE.Texture | null>(null);
    const coverTextureRef = useRef<THREE.Texture | null>(null);
    
    // Store program refs to update uniforms
    const displayProgramRef = useRef<THREE.ShaderMaterial | null>(null);

    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { variantRef.current = variant; }, [variant]);

    // Helper to calculate aspect ratio corrected scale for Shader
    const calculateTextureScale = (texture: THREE.Texture, width: number, height: number, mode: string = 'COVER') => {
        const img = texture.image as any; // Cast to any to access width/height safely
        if (!img || !img.width) return { scale: new THREE.Vector2(1, 1), offset: new THREE.Vector2(0, 0) };
        
        const screenAspect = width / height;
        const imageAspect = img.width / img.height;
        const aspectFactor = imageAspect / screenAspect;
        
        const scale = new THREE.Vector2(1, 1);
        
        if (mode === 'COVER') {
            if (aspectFactor < 1) { 
                // Image is taller than screen relative to width
                // Match Width (scale.x = 1), Crop Height (scale.y < 1)
                // We compress UVs on Y to sample a smaller portion of the texture
                scale.set(1.0, aspectFactor);
            } else {
                // Image is wider than screen
                // Match Height (scale.y = 1), Crop Width (scale.x < 1)
                scale.set(1.0 / aspectFactor, 1.0);
            }
        } else if (mode === 'CONTAIN') {
             if (aspectFactor < 1) { 
                scale.set(1.0 / aspectFactor, 1.0);
            } else {
                scale.set(1.0, aspectFactor);
            }
        }
        
        return { scale, offset: new THREE.Vector2(0, 0) };
    };

    // Update Uniforms based on current window size
    const updateAllUniforms = (width: number, height: number) => {
        if (!displayProgramRef.current) return;
        
        const mode = configRef.current.sizingMode || 'COVER';
        
        if (imageTextureRef.current) {
            const { scale, offset } = calculateTextureScale(imageTextureRef.current, width, height, mode);
            displayProgramRef.current.uniforms.uImageScale.value.copy(scale);
            displayProgramRef.current.uniforms.uImageOffset.value.copy(offset);
        }
        
        if (coverTextureRef.current) {
            const { scale, offset } = calculateTextureScale(coverTextureRef.current, width, height, mode);
            displayProgramRef.current.uniforms.uCoverScale.value.copy(scale);
            displayProgramRef.current.uniforms.uCoverOffset.value.copy(offset);
        }
    };

    useEffect(() => {
        if (!mountRef.current) return;
        updateAllUniforms(window.innerWidth, window.innerHeight);
    }, [config.sizingMode]);

    useEffect(() => {
        if (!mountRef.current) return;
        const container = mountRef.current;
        
        onLog("Initializing Fluid Reveal Engine...");

        const renderer = new THREE.WebGLRenderer({ 
            antialias: false, 
            alpha: false, 
            powerPreference: "high-performance",
            depth: false,
            stencil: false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const simRes = 512; 
        const aspectRatio = window.innerWidth / window.innerHeight;

        const createFBO = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });

        const createDoubleFBO = (w: number, h: number) => {
            let read = createFBO(w, h);
            let write = createFBO(w, h);
            return {
                read: () => read,
                write: () => write,
                swap: () => { let t = read; read = write; write = t; }
            };
        };

        let density = createDoubleFBO(simRes, simRes);
        let velocity = createDoubleFBO(simRes, simRes);
        let divergence = createFBO(simRes, simRes);
        let pressure = createDoubleFBO(simRes, simRes);

        const geometry = new THREE.PlaneGeometry(2, 2);
        const scene = new THREE.Scene();
        // Cast as THREE.Mesh to allow material swapping with ShaderMaterial later
        const quad = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()) as THREE.Mesh;
        scene.add(quad);
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const createProgram = (frag: string) => new THREE.ShaderMaterial({
            vertexShader: baseVertexShader,
            fragmentShader: frag,
            uniforms: {
                uTexelSize: { value: new THREE.Vector2(1.0 / simRes, 1.0 / simRes) },
                uDt: { value: 0.016 },
                uAspectRatio: { value: aspectRatio },
                uDissipation: { value: 1.0 },
                uVelocity: { value: null },
                uSource: { value: null },
                uTarget: { value: null },
                uColor: { value: new THREE.Vector3() },
                uPoint: { value: new THREE.Vector2() },
                uRadius: { value: 0.01 },
                uDivergence: { value: null },
                uPressure: { value: null },
                uImage: { value: null }, // Top Layer
                uCover: { value: null }, // Bottom Layer
                uImageScale: { value: new THREE.Vector2(1, 1) },
                uImageOffset: { value: new THREE.Vector2(0, 0) },
                uCoverScale: { value: new THREE.Vector2(1, 1) },
                uCoverOffset: { value: new THREE.Vector2(0, 0) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uDensity: { value: null },
                uVariant: { value: 0 }
            },
            depthWrite: false,
            depthTest: false
        });

        const programs = {
            advection: createProgram(advectionShader),
            splat: createProgram(splatShader),
            divergence: createProgram(divergenceShader),
            pressure: createProgram(pressureShader),
            gradientSubtract: createProgram(gradientSubtractShader),
            display: createProgram(displayShader)
        };

        // Save Ref for updates
        displayProgramRef.current = programs.display;

        const loader = new THREE.TextureLoader();
        
        const setupTexture = (url: string, ref: React.MutableRefObject<THREE.Texture | null>) => {
            return loader.load(url, (tex) => {
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                // We handle wrapping manually via shader crop logic, but clamp is safer
                tex.wrapS = THREE.ClampToEdgeWrapping;
                tex.wrapT = THREE.ClampToEdgeWrapping;
                ref.current = tex;
                updateAllUniforms(window.innerWidth, window.innerHeight);
            });
        };

        // Load "Lando" Style Layers
        // Top Layer (Revealed): Detailed/Colorful Portrait
        programs.display.uniforms.uImage.value = setupTexture(
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop', 
            imageTextureRef
        );
        // Bottom Layer (Background): Dark/Atmospheric
        programs.display.uniforms.uCover.value = setupTexture(
            'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2600&auto=format&fit=crop', 
            coverTextureRef
        );

        // Input Handling
        const pointer = new THREE.Vector2(0.5, 0.5);
        const lastPointer = new THREE.Vector2(0.5, 0.5);
        let isInteracting = false;

        const updatePointer = (x: number, y: number) => {
            pointer.set(x / window.innerWidth, 1.0 - (y / window.innerHeight));
        };

        const onDown = (e: PointerEvent) => {
            if(!e.isPrimary) return;
            isInteracting = true;
            updatePointer(e.clientX, e.clientY);
            lastPointer.set(pointer.x - 0.01, pointer.y - 0.01);
            (e.target as Element).setPointerCapture(e.pointerId);
        };

        const onMove = (e: PointerEvent) => {
            if(!e.isPrimary) return;
            updatePointer(e.clientX, e.clientY);
        };

        const onUp = (e: PointerEvent) => { 
            isInteracting = false; 
            if (e.target instanceof Element && e.target.hasPointerCapture(e.pointerId)) {
                e.target.releasePointerCapture(e.pointerId);
            }
        };

        const onResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h);
            programs.display.uniforms.uAspectRatio.value = w / h;
            updateAllUniforms(w, h);
        };

        container.addEventListener('pointerdown', onDown);
        container.addEventListener('pointermove', onMove);
        container.addEventListener('pointerup', onUp);
        container.addEventListener('pointerleave', onUp);
        window.addEventListener('resize', onResize);

        const renderStep = (target: THREE.WebGLRenderTarget | null) => {
            renderer.setRenderTarget(target);
            renderer.render(scene, camera);
        };

        let lastTime = Date.now();

        const update = () => {
            const now = Date.now();
            let dt = Math.min((now - lastTime) / 1000, 0.016);
            lastTime = now;

            const currentVariant = variantRef.current;
            
            // Update Mouse Uniform for Parallax
            programs.display.uniforms.uMouse.value.copy(pointer);

            if (isInteracting) {
                const dx = pointer.x - lastPointer.x;
                const dy = pointer.y - lastPointer.y;
                const distSq = dx*dx + dy*dy;

                if (distSq > 0.000001) { 
                    const dist = Math.sqrt(distSq);
                    const steps = Math.max(1, Math.ceil(dist / 0.002));

                    for (let i = 0; i < steps; i++) {
                        const t = (i + 1) / steps;
                        const lerpX = lastPointer.x + dx * t;
                        const lerpY = lastPointer.y + dy * t;

                        // Advect Velocity
                        programs.splat.uniforms.uTarget.value = velocity.read().texture;
                        programs.splat.uniforms.uPoint.value.set(lerpX, lerpY);
                        programs.splat.uniforms.uColor.value.set(dx * 5000.0, dy * 5000.0, 1.0);
                        programs.splat.uniforms.uRadius.value = configRef.current.splatRadius / 10000.0;
                        quad.material = programs.splat;
                        renderStep(velocity.write());
                        velocity.swap();

                        // Add Dye (Density) - White dye for the reveal mask
                        programs.splat.uniforms.uTarget.value = density.read().texture;
                        programs.splat.uniforms.uPoint.value.set(lerpX, lerpY);
                        programs.splat.uniforms.uColor.value.set(5.0, 5.0, 5.0); // Intensity
                        programs.splat.uniforms.uRadius.value = configRef.current.splatRadius / 5000.0;
                        quad.material = programs.splat;
                        renderStep(density.write());
                        density.swap();
                    }
                }
                lastPointer.copy(pointer);
            }

            // --- GPGPU Simulation Passes ---

            // 1. Divergence
            programs.divergence.uniforms.uVelocity.value = velocity.read().texture;
            quad.material = programs.divergence;
            renderStep(divergence);

            // 2. Pressure (Jacobi)
            programs.pressure.uniforms.uDivergence.value = divergence.texture;
            quad.material = programs.pressure;
            for (let i = 0; i < 40; i++) {
                programs.pressure.uniforms.uPressure.value = pressure.read().texture;
                renderStep(pressure.write());
                pressure.swap();
            }

            // 3. Subtract Gradient
            programs.gradientSubtract.uniforms.uPressure.value = pressure.read().texture;
            programs.gradientSubtract.uniforms.uVelocity.value = velocity.read().texture;
            quad.material = programs.gradientSubtract;
            renderStep(velocity.write());
            velocity.swap();

            // 4. Advection (Velocity)
            programs.advection.uniforms.uDt.value = dt;
            programs.advection.uniforms.uDissipation.value = configRef.current.velocityDissipation; 
            programs.advection.uniforms.uSource.value = velocity.read().texture;
            programs.advection.uniforms.uVelocity.value = velocity.read().texture;
            quad.material = programs.advection;
            renderStep(velocity.write());
            velocity.swap();

            // 5. Advection (Density)
            programs.advection.uniforms.uDissipation.value = configRef.current.densityDissipation;
            programs.advection.uniforms.uSource.value = density.read().texture;
            programs.advection.uniforms.uVelocity.value = velocity.read().texture;
            quad.material = programs.advection;
            renderStep(density.write());
            density.swap();

            // 6. Display
            programs.display.uniforms.uDensity.value = density.read().texture;
            programs.display.uniforms.uVelocity.value = velocity.read().texture;
            programs.display.uniforms.uPressure.value = pressure.read().texture;
            programs.display.uniforms.uVariant.value = currentVariant;
            quad.material = programs.display;
            renderStep(null);

            requestAnimationFrame(update);
        };

        update();

        return () => {
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            container.removeEventListener('pointerdown', onDown);
            container.removeEventListener('pointermove', onMove);
            container.removeEventListener('pointerup', onUp);
            container.removeEventListener('pointerleave', onUp);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={mountRef} 
            style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', 
                height: '100%', 
                zIndex: 0,
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                cursor: 'default',
                pointerEvents: 'auto'
            }} 
        />
    );
};

export default FluidCanvas;

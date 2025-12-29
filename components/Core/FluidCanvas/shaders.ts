
export const baseVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const splatShader = `
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec3 uColor;
    uniform vec2 uPoint;
    uniform float uRadius;

    varying vec2 vUv;

    void main() {
        vec2 p = vUv - uPoint.xy;
        p.x *= uAspectRatio;
        vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`;

export const divergenceShader = `
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    varying vec2 vUv;

    void main() {
        float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
        float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
        float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;

        float C = texture2D(uVelocity, vUv).x;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        
        // Divergence
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`;

export const pressureShader = `
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;

    varying vec2 vUv;

    void main() {
        float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
        float C = texture2D(uDivergence, vUv).x;

        float pressure = (L + R + B + T - C) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`;

export const gradientSubtractShader = `
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;

    varying vec2 vUv;

    void main() {
        float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

export const advectionShader = `
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;

    varying vec2 vUv;

    void main() {
        vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
        vec4 result = texture2D(uSource, coord);
        // Direct multiplication for precise decay control
        gl_FragColor = result * uDissipation;
    }
`;

export const displayShader = `
    uniform sampler2D uDensity;
    uniform sampler2D uVelocity;
    uniform sampler2D uImage; // Top Layer (Reveal)
    uniform sampler2D uCover; // Bottom Layer (Background)
    uniform vec2 uImageScale;
    uniform vec2 uImageOffset;
    uniform vec2 uCoverScale;
    uniform vec2 uCoverOffset;
    uniform vec2 uMouse; // 0..1
    uniform int uVariant;

    varying vec2 vUv;

    void main() {
        // GPGPU Fluid Density (0.0 to 1.0)
        float d = texture2D(uDensity, vUv).r;
        
        // --- Parallax Logic ---
        // Calculate offset based on mouse position. 
        // We invert direction (-0.5) so background moves opposite to mouse (perspective).
        vec2 parallaxDir = uMouse - 0.5; 

        // 1. Bottom Layer (Background) - Low parallax intensity
        vec2 uvBottom = (vUv - 0.5) * uCoverScale + 0.5 + uCoverOffset;
        uvBottom += parallaxDir * 0.015; // Subtle movement
        vec3 bottomColor = texture2D(uCover, uvBottom).rgb;

        // 2. Top Layer (Reveal) - Higher parallax intensity
        // This makes the revealed layer feel like it's "floating" above the background.
        vec2 uvTop = (vUv - 0.5) * uImageScale + 0.5 + uImageOffset;
        uvTop += parallaxDir * 0.035; // Stronger movement
        vec3 topColor = texture2D(uImage, uvTop).rgb;

        // --- Mix Logic ---
        // Lando Norris Effect: Use density as a mask to reveal Top over Bottom.
        
        float mask = smoothstep(0.0, 0.4, d); // Smooth threshold
        vec3 finalColor = mix(bottomColor, topColor, mask);

        // Optional: Add a subtle chromatic aberration or glow based on velocity for extra flair
        // (Simplified for this request to stick to the core effect)

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;
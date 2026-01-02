/**
 * GPU-based flow particle shaders for current visualization
 */

export const flowParticleVertexShader = /* glsl */ `
  precision highp float;

  attribute float offset;
  attribute float speed;
  attribute vec3 pathStart;
  attribute vec3 pathEnd;

  uniform float time;
  uniform float flowSpeed;
  uniform float particleSize;
  uniform vec3 pathControl1;
  uniform vec3 pathControl2;

  varying vec3 vColor;
  varying float vAlpha;

  // Cubic bezier interpolation
  vec3 cubicBezier(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
    float t2 = t * t;
    float t3 = t2 * t;
    float mt = 1.0 - t;
    float mt2 = mt * mt;
    float mt3 = mt2 * mt;

    return p0 * mt3 +
           p1 * 3.0 * mt2 * t +
           p2 * 3.0 * mt * t2 +
           p3 * t3;
  }

  void main() {
    // Calculate position along path
    float t = fract(offset + time * flowSpeed * speed);

    // Bezier curve position
    vec3 pos = cubicBezier(pathStart, pathControl1, pathControl2, pathEnd, t);

    // Fade at endpoints
    float edgeFade = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.9, t);

    // Pulse effect
    float pulse = 0.8 + 0.2 * sin(time * 10.0 + offset * 6.28);

    vAlpha = edgeFade * pulse;
    vColor = mix(vec3(0.0, 0.8, 1.0), vec3(1.0, 1.0, 0.0), speed);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = particleSize * (300.0 / -mvPosition.z) * vAlpha;
  }
`;

export const flowParticleFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle with soft edge
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) {
      discard;
    }

    float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));

    // Glow effect
    vec3 glow = vColor * (1.0 + 0.5 * (1.0 - dist * 2.0));

    gl_FragColor = vec4(glow, alpha);
  }
`;

/**
 * Wire glow shader for power indication
 */
export const wireGlowVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wireGlowFragmentShader = /* glsl */ `
  uniform vec3 color;
  uniform float intensity;
  uniform float time;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // Fresnel-like edge glow
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);

    // Animated pulse
    float pulse = 0.8 + 0.2 * sin(time * 5.0 - vUv.x * 10.0);

    vec3 glowColor = color * intensity * fresnel * pulse;
    float alpha = fresnel * intensity * 0.5;

    gl_FragColor = vec4(glowColor, alpha);
  }
`;

/**
 * LED glow shader
 */
export const ledGlowVertexShader = /* glsl */ `
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ledGlowFragmentShader = /* glsl */ `
  uniform vec3 color;
  uniform float brightness;
  uniform float time;

  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    // Radial falloff from center
    float dist = length(vPosition.xy);
    float falloff = 1.0 - smoothstep(0.0, 3.0, dist);

    // Subtle flicker for realism
    float flicker = 0.98 + 0.02 * sin(time * 120.0);

    // View-dependent intensity
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float viewAngle = max(dot(vNormal, viewDir), 0.0);

    float intensity = brightness * falloff * flicker * (0.5 + 0.5 * viewAngle);

    gl_FragColor = vec4(color * intensity * 2.0, intensity);
  }
`;

export const UV_VERTEX_SHADER = `
#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 a_position;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;

void main() {
  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position.xyz, 1.0);
}
`
export const UV_FRAGMENT_SHADER = `
#ifdef GL_ES
  precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  vec3 finalColor = vec3(uv, sin(u_time));
  gl_FragColor = vec4(finalColor, 1.0);
}
`

export const VERTEX_SHADER = `
#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 a_position;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;

uniform vec3 u_color[5];

uniform float u_time;
uniform float u_seed;

varying vec3 v_color;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

//	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vec2 noiseCoord = a_position.xy * vec2(3.0, 4.0);

  float noise = snoise(
      vec3(
          noiseCoord.x + u_time * 3.0 + u_seed,
          noiseCoord.y + u_seed,
          u_time * 10.0 + u_seed
      )
  );

  noise = max(0.0, noise);
  
  float tilt = -1.2 * a_position.y;
  float incline = a_position.x * 0.1;
  float offset = incline * mix(-0.25, 0.25, a_position.y);

  vec3 pos = vec3(a_position.x, a_position.y, a_position.z + noise * 0.3 + tilt + incline + offset);
  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(pos, 1.0);

  v_color = u_color[4];

  float noiseFloor = 0.1;
  vec2 noiseFreq = vec2(0.3, 0.4);

  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float noiseFlow = 5.0 + fi * 0.3;
    float noiseSpeed = 10.0 + fi * 0.3;

    float noiseSeed = 1.0 + fi * (u_seed + 12.0);
    float noiseCeil = 0.6 + fi * 0.07;

    float noise = smoothstep(noiseFloor, noiseCeil, snoise(
        vec3(
            noiseCoord.x * noiseFreq.x + u_time * noiseFlow,
            noiseCoord.y * noiseFreq.y,
            u_time * noiseSpeed + noiseSeed
        )
    ));

    v_color = mix(v_color, u_color[i], noise);
  }
}
`
export const FRAGMENT_SHADER = `
#ifdef GL_ES
  precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity;
uniform vec3 u_color[5];

varying vec3 v_color;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  vec3 finalColor = v_color;

  // Random noise
  if (u_intensity > 0.0) {
    float noise = random(uv) * u_intensity;
    finalColor = mix(v_color, u_color[4], noise);
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
`

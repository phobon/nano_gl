export const VERTEX_SHADER = `
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
export const FRAGMENT_SHADER = `
#ifdef GL_ES
  precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  vec3 finalColor = vec3(uv, 1.0);
  gl_FragColor = vec4(finalColor, 1.0);
}
`

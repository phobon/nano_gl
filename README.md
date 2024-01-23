# NanoGL

NanoGL is a very lightweight WebGL library that provides a simple interface for creating and manipulating full-screen shader materials.

## Why is this a thing?

There are a lot of great WebGL libraries out there, and I'd recommend using them for almost everything. There's no but here, I just wanted to create something that didn't require _any_ dependencies, and was as simple as possible to output a full-sceren shader material to the screen.

## How to use

A very minimal example of how to use NanoGL is below. Note that NanoGl will automatically resize the canvas to the size of the window, but it will not render itself; you need to set up a basic render loop using `requestAnimationFrame` and call `nanoGl.render()` on each frame.

```
const VERTEX_SHADER = `
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

const FRAGMENT_SHADER = `
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

const nanoGl = new NanoGl(canvas, VERTEX_SHADER, FRAGMENT_SHADER)

nanoGl.addUniform("intensity", UNIFORM.float)
nanoGl.addUniform("seed", UNIFORM.float)

let updateSeedFrame = 100
const render = (delta: number = 0) => {
  const now = Date.now()

  // Update any uniforms here
  if (updateSeedFrame === 0) {
    nanoGl.updateUniform("seed", now)
    updateSeedFrame = 100
  } else {
    updateSeedFrame -= 1
  }

  nanoGl.updateUniform("intensity", Math.sin(now / 1000))

  // Render the shader
  nanoGl.render(delta)

  // Set up a frame loop
  requestAnimationFrame(render)
}

```

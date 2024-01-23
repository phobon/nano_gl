import './style.css'

import { NanoGl, UNIFORM } from './nano_gl/nano_gl.ts'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './nano_gl/shaders.ts'

document.querySelector<HTMLDivElement>('#app')!

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!

const widthSegments = 32
const heightSegments = 32
const nanoGl = new NanoGl(canvas, VERTEX_SHADER, FRAGMENT_SHADER, {
  widthSegments,
  heightSegments,
})

// Create uniforms for use in shader
nanoGl.addUniform('resolution', UNIFORM.vec2)
nanoGl.addUniform('time', UNIFORM.float)

// Set up a listener on resize to update the canvas size
const resizeCanvas = () => {
  const width = (canvas.width = window.innerWidth)
  const height = (canvas.height = window.innerHeight)
  nanoGl.updateUniform('resolution', width, height)
  nanoGl.viewport(0, 0, width, height)
}
window.addEventListener('resize', resizeCanvas)
resizeCanvas()

let animationStartTime = 0
const updateUniformsAndRender = (delta: number = 0) => {
  // Update uniforms if necessary
  const currentTime = animationStartTime + delta * 0.00001
  animationStartTime = currentTime

  nanoGl.updateUniform('time', animationStartTime)

  // Render the full screen plane
  nanoGl.render()
  requestAnimationFrame(updateUniformsAndRender)
}

updateUniformsAndRender()

import './style.css'

import { NanoGl } from './nano_gl/nano_gl.ts'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './nano_gl/shaders.ts'

document.querySelector<HTMLDivElement>('#app')!

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!

// Minimal example of how to use NanoGl
const nanoGl = new NanoGl(canvas, VERTEX_SHADER, FRAGMENT_SHADER)
const updateUniformsAndRender = (delta: number = 0) => {
  nanoGl.render(delta)
  requestAnimationFrame(updateUniformsAndRender)
}
updateUniformsAndRender()

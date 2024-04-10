import './style.css'

import { NanoGl, UNIFORM } from './nano_gl/nano_gl.ts'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './nano_gl/shaders.ts'
import { NICE_PALETTES_HEX, rgbStringToArray, hexStringToRgb } from './nano_gl/utils.ts'

document.querySelector<HTMLDivElement>('#app')!

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!

// Choose a nice colour palette (can really be any length here, but 5 is generally good)
const colors = NICE_PALETTES_HEX[1]

// Convert hex string colors to RGB and create a buffer to use
const colorArray = new Float32Array(colors.length * 3)
const colorsToRgb = colors.map((color: string) => {
  const hexToRgb = hexStringToRgb(color)!
  return rgbStringToArray(hexToRgb)
})
for (let i = 0; i < 5; i++) {
  colorArray.set(colorsToRgb[i], i * 3)
}

// Instantiate NanoGl
const nanoGl = new NanoGl(canvas, VERTEX_SHADER, FRAGMENT_SHADER, {
  timeScalar: 0.00001,
  widthSegments: 128,
  heightSegments: 128,
})

// Add some our uniforms - the third parameter is optional
nanoGl.addUniform('intensity', UNIFORM.float, 0.15)
nanoGl.addUniform('seed', UNIFORM.float, 0)
nanoGl.addUniform('color', UNIFORM.vec3Array, colorArray)

// This is the main render loop - update uniforms (not time or resolution as they're handled in NanoGL)
const updateUniformsAndRender = (delta: number = 0) => {
  nanoGl.render(delta)
  requestAnimationFrame(updateUniformsAndRender)
}
updateUniformsAndRender()

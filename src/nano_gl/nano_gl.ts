export const UNIFORM = {
  float: '1f',
  vec2: '2f',
  vec3: '3f',
  vec3Array: '3fv',
}

export type Vector3 = [number, number, number]

export class Mat4 {
  static EPSILON = 0.000001
  public create() {
    const out = new Float32Array(16)
    out[0] = 1
    out[5] = 1
    out[10] = 1
    out[15] = 1
    return out
  }

  public identity(out: Float32Array) {
    out[0] = 1
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = 1
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = 1
    out[11] = 0
    out[12] = 0
    out[13] = 0
    out[14] = 0
    out[15] = 1
    return out
  }

  public lookAt(out: Float32Array, eye: Vector3, center: Vector3, up: Vector3) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len
    let eyex = eye[0]
    let eyey = eye[1]
    let eyez = eye[2]
    let upx = up[0]
    let upy = up[1]
    let upz = up[2]
    let centerx = center[0]
    let centery = center[1]
    let centerz = center[2]

    if (
      Math.abs(eyex - centerx) < Mat4.EPSILON &&
      Math.abs(eyey - centery) < Mat4.EPSILON &&
      Math.abs(eyez - centerz) < Mat4.EPSILON
    ) {
      return this.identity(out)
    }

    z0 = eyex - centerx
    z1 = eyey - centery
    z2 = eyez - centerz

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2)
    z0 *= len
    z1 *= len
    z2 *= len

    x0 = upy * z2 - upz * z1
    x1 = upz * z0 - upx * z2
    x2 = upx * z1 - upy * z0
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2)
    if (!len) {
      x0 = 0
      x1 = 0
      x2 = 0
    } else {
      len = 1 / len
      x0 *= len
      x1 *= len
      x2 *= len
    }

    y0 = z1 * x2 - z2 * x1
    y1 = z2 * x0 - z0 * x2
    y2 = z0 * x1 - z1 * x0

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2)
    if (!len) {
      y0 = 0
      y1 = 0
      y2 = 0
    } else {
      len = 1 / len
      y0 *= len
      y1 *= len
      y2 *= len
    }

    out[0] = x0
    out[1] = y0
    out[2] = z0
    out[3] = 0
    out[4] = x1
    out[5] = y1
    out[6] = z1
    out[7] = 0
    out[8] = x2
    out[9] = y2
    out[10] = z2
    out[11] = 0
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez)
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez)
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez)
    out[15] = 1

    return out
  }

  public perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number) {
    const f = 1.0 / Math.tan(fovy / 2)
    out[0] = f / aspect
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = f
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[11] = -1
    out[12] = 0
    out[13] = 0
    out[15] = 0
    if (far != null && far !== Infinity) {
      const nf = 1 / (near - far)
      out[10] = (far + near) * nf
      out[14] = 2 * far * near * nf
    } else {
      out[10] = -1
      out[14] = -2 * near
    }
    return out
  }
}

export const mat4 = new Mat4()

export class Uniform {
  public name: string

  private readonly _suffix: string
  private readonly _location: WebGLUniformLocation
  private readonly _method: string

  private readonly _gl: WebGLRenderingContext

  constructor(gl: WebGLRenderingContext, program: WebGLProgram, name: string, suffix: string) {
    this.name = name
    this._suffix = suffix
    this._location = gl.getUniformLocation(program, name) as WebGLUniformLocation

    this._gl = gl

    this._method = 'uniform' + this._suffix
  }

  public set(...values: any[]) {
    var args = [this._location].concat(values)

    try {
      // @ts-ignore
      this._gl[this._method].apply(this._gl, args)
    } catch (e) {
      debugger
      console.log(e)
    }
  }
}

export class Plane {
  public position: WebGLBuffer
  public indices: WebGLBuffer
  public count: number

  constructor(
    gl: WebGLRenderingContext,
    options: {
      scale?: number
      widthSegments?: number
      heightSegments?: number
    },
  ) {
    const positions = []
    const indices = []

    const { scale = 1, widthSegments = 32, heightSegments = 32 } = options || {}

    const width = 2 / widthSegments / scale
    const height = 2 / heightSegments / scale

    for (let y = 0; y <= heightSegments; y++) {
      for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments
        const v = y / heightSegments

        positions.push(
          -1 + x * width * scale, // x
          -1 + y * height * scale, // y
          0, // z
          u, // u
          v, // v
        )

        if (x < widthSegments && y < heightSegments) {
          const a = x + y * (widthSegments + 1)
          const b = x + (y + 1) * (widthSegments + 1)
          const c = x + 1 + (y + 1) * (widthSegments + 1)
          const d = x + 1 + y * (widthSegments + 1)

          indices.push(a, b, d)
          indices.push(b, c, d)
        }
      }
    }

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    this.position = positionBuffer as WebGLBuffer

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    this.indices = indexBuffer as WebGLBuffer
    this.count = indices.length
  }

  public render(gl: WebGLRenderingContext) {
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0)
  }
}

export class NanoGl {
  private readonly _gl: WebGLRenderingContext
  private readonly _program: WebGLProgram
  private readonly _plane: Plane

  public uniforms: { [index: string]: Uniform } = {}

  constructor(
    canvas: HTMLCanvasElement,
    vertexShader: string,
    fragmentShader: string,
    planeOptions?: {
      width?: number
      height?: number
      widthSegments?: number
      heightSegments?: number
    },
  ) {
    // Initialise WebGL
    const gl = canvas.getContext('webgl') as WebGLRenderingContext
    if (!gl) {
      throw new Error('WebGL not supported')
    }

    this._gl = gl
    this._program = this._gl.createProgram() as WebGLProgram

    // Add shaders
    this.addShader(vertexShader, this._gl.VERTEX_SHADER)
    this.addShader(fragmentShader, this._gl.FRAGMENT_SHADER)

    // Finalise setup
    this._gl.linkProgram(this._program)
    // add this for extra debugging
    if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
      var info = gl.getProgramInfoLog(this._program)
      throw new Error('Could not compile WebGL program. \n\n' + info)
    }
    this._gl.useProgram(this._program)

    const {
      widthSegments = 32,
      heightSegments = 32,
      width = window?.innerWidth || canvas.width,
      height = window?.innerHeight || canvas.height,
    } = planeOptions || {}
    this._plane = this.addPlane(width, height, widthSegments, heightSegments)
  }

  private addShader(source: string, type: number) {
    const shader = this._gl.createShader(type) as WebGLShader
    this._gl.shaderSource(shader, source)
    this._gl.compileShader(shader)
    var isCompiled = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)
    if (!isCompiled) {
      throw new Error('Shader compile error: ' + this._gl.getShaderInfoLog(shader))
    }
    this._gl.attachShader(this._program, shader)
  }

  public addUniform(name: string, suffix: string): Uniform {
    const uniform = new Uniform(this._gl, this._program, `u_${name}`, suffix)
    this.uniforms[name] = uniform
    return uniform
  }

  public updateUniform(name: string, ...values: any[]) {
    this.uniforms[name].set(...values)
  }

  public viewport(x: number, y: number, width: number, height: number) {
    this._gl.viewport(x, y, width, height)
  }

  public render() {
    if (!this._plane) {
      return
    }

    this._plane.render(this._gl)
  }

  private addPlane(
    width: number,
    height: number,
    widthSegments: number,
    heightSegments: number,
    scale: number = 1,
  ): Plane {
    // Create position attribute to provide a full screen plane
    const positionAttributeLocation = this._gl.getAttribLocation(this._program, 'a_position')
    const projectionMatrixUniformLocation = this._gl.getUniformLocation(this._program, 'u_projectionMatrix')
    const modelViewMatrixUniformLocation = this._gl.getUniformLocation(this._program, 'u_modelViewMatrix')
    const plane = new Plane(this._gl, {
      widthSegments,
      heightSegments,
      scale,
    })

    // Create a perspective projection matrix
    const fov = (Math.PI * 25) / 180
    const aspect = width / height // aspect ratio of the canvas
    const near = 0.01 // near clipping plane
    const far = 100 // far clipping plane
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, fov, aspect, near, far)

    // Create a model-view matrix
    const eye: Vector3 = [0, 0, 1.2] // position of the camera
    const center: Vector3 = [0, 0, 0] // point the camera is looking at
    const up: Vector3 = [0, 1, 0] // up direction
    const modelViewMatrix = mat4.create()
    mat4.lookAt(modelViewMatrix, eye, center, up)

    this._gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix)
    this._gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix)

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, plane.position)
    this._gl.enableVertexAttribArray(positionAttributeLocation)
    this._gl.vertexAttribPointer(positionAttributeLocation, 3, this._gl.FLOAT, false, 20, 0)

    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, plane.indices)

    return plane
  }
}

import { inverseMatrix, type Motion, type Vec3 } from './steeple-physics';

const vertexSource = `
  attribute vec3 aPosition;
  uniform mat3 uInverse;
  uniform float uSqueeze;
  uniform float uDent;
  uniform vec3 uPress;
  uniform vec2 uAxis;
  varying mediump vec3 vLocal;
  varying mediump vec3 vNormal;
  void main() {
    vec3 n = aPosition;
    float alignment = dot(n, uPress);
    float dent = uDent * exp(-14.0 * (1.0 - alignment));
    float radius = 1.0 - dent;
    vec3 gradient = -14.0 * dent * (uPress - alignment * n);

    // Flatten along uAxis and bulge across it, like a stress ball pressed or hitting a wall.
    float across = 1.0 + .6 * uSqueeze;
    float along = 1.0 - .8 * uSqueeze;
    float depth = 1.0 + .2 * uSqueeze;
    vec3 p = n * radius;
    float pa = dot(p.xy, uAxis);
    vec3 position = vec3((p.xy - pa * uAxis) * across + pa * along * uAxis, p.z * depth);
    vec3 m = radius * n - gradient;
    float ma = dot(m.xy, uAxis);
    vNormal = normalize(vec3((m.xy - ma * uAxis) / across + ma / along * uAxis, m.z / depth));

    // Inverse rotation maps the existing flat artwork onto a real spherical mesh.
    // At rest its front projection matches the original illustration exactly.
    vLocal = uInverse * n;
    gl_Position = vec4(position.xy * .85625, -position.z * .5, 1.0);
  }
`;

const fragmentSource = `
  precision mediump float;
  uniform sampler2D uFront;
  uniform sampler2D uBack;
  varying mediump vec3 vLocal;
  varying mediump vec3 vNormal;
  void main() {
    vec3 local = normalize(vLocal);
    vec2 uv = local.xy * .5 + .5;
    vec4 front = texture2D(uFront, uv);
    vec4 back = texture2D(uBack, uv);
    vec4 ink = mix(back, front, smoothstep(-.025, .025, local.z));
    vec3 base = mix(vec3(.0863, .2941, .7686), ink.rgb, ink.a);
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(vec3(-.5, .65, 1.2));
    float diffuse = max(dot(normal, light), 0.0);
    float sheen = pow(max(dot(normal, normalize(light + vec3(0., 0., 1.))), 0.0), 28.0);
    float rim = pow(1.0 - max(normal.z, 0.0), 3.0);
    vec3 color = base * (.62 + .38 * diffuse) + vec3(.12, .15, .2) * sheen;
    color += vec3(.04, .08, .16) * rim;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function sphereMesh() {
  const positions: number[] = [];
  const indices: number[] = [];
  const rows = 48, columns = 72;
  for (let row = 0; row <= rows; row++) {
    const latitude = row / rows * Math.PI;
    for (let column = 0; column <= columns; column++) {
      const longitude = column / columns * Math.PI * 2;
      positions.push(Math.sin(latitude) * Math.cos(longitude), Math.cos(latitude), Math.sin(latitude) * Math.sin(longitude));
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column, b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
}

function artworkImage(artwork: SVGSVGElement, back: boolean, signal: AbortSignal): Promise<HTMLImageElement> {
  const copy = artwork.cloneNode(true) as SVGSVGElement;
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('viewBox', '185 16 274 274');
  copy.setAttribute('width', '1024');
  copy.setAttribute('height', '1024');
  copy.removeAttribute('class');
  if (back) copy.querySelector('[data-steeple]')?.remove();
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }));
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      URL.revokeObjectURL(url);
      signal.removeEventListener('abort', abort);
      image.onload = null;
      image.onerror = null;
    };
    const abort = () => {
      cleanup();
      image.src = '';
      reject(new DOMException('Aborted', 'AbortError'));
    };
    image.onload = () => { cleanup(); resolve(image); };
    image.onerror = () => { cleanup(); reject(new Error('Unable to prepare steeple artwork')); };
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    else image.src = url;
  });
}

export type Sphere = {
  draw: (motion: Motion, press: Vec3) => void;
  resize: (size: number) => void;
  dispose: () => void;
};

export async function createSphere(canvas: HTMLCanvasElement, artwork: SVGSVGElement, signal: AbortSignal): Promise<Sphere> {
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: true, depth: true, stencil: false,
    powerPreference: 'low-power', failIfMajorPerformanceCaveat: true,
  });
  if (!gl) throw new Error('No suitable WebGL context');
  const shaders: WebGLShader[] = [];
  const buffers: WebGLBuffer[] = [];
  const textures: WebGLTexture[] = [];
  let program: WebGLProgram | null = null;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    shaders.forEach(shader => gl.deleteShader(shader));
    buffers.forEach(buffer => gl.deleteBuffer(buffer));
    textures.forEach(texture => gl.deleteTexture(texture));
    if (program) gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  try {
    const [front, back] = await Promise.all([artworkImage(artwork, false, signal), artworkImage(artwork, true, signal)]);
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Cannot create sphere shader');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Cannot compile sphere shader');
      return shader;
    };
    program = gl.createProgram();
    if (!program) throw new Error('Cannot create sphere program');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Cannot link sphere program');
    gl.useProgram(program);
    const mesh = sphereMesh();
    for (const [target, data] of [[gl.ARRAY_BUFFER, mesh.positions], [gl.ELEMENT_ARRAY_BUFFER, mesh.indices]] as const) {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error('Cannot allocate sphere mesh');
      buffers.push(buffer);
      gl.bindBuffer(target, buffer);
      gl.bufferData(target, data, gl.STATIC_DRAW);
    }
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    for (const [unit, image] of [front, back].entries()) {
      const texture = gl.createTexture();
      if (!texture) throw new Error('Cannot allocate sphere texture');
      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.uniform1i(gl.getUniformLocation(program, 'uFront'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uBack'), 1);
    const inverse = gl.getUniformLocation(program, 'uInverse');
    const squeeze = gl.getUniformLocation(program, 'uSqueeze');
    const dent = gl.getUniformLocation(program, 'uDent');
    const press = gl.getUniformLocation(program, 'uPress');
    const axis = gl.getUniformLocation(program, 'uAxis');
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    if (gl.getError() !== gl.NO_ERROR) throw new Error('Sphere setup failed');
    return {
      draw(motion, point) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix3fv(inverse, false, inverseMatrix(motion.orientation));
        gl.uniform1f(squeeze, motion.squeeze);
        gl.uniform1f(dent, motion.dent);
        gl.uniform3f(press, point[0], point[1], point[2]);
        gl.uniform2f(axis, motion.axis[0], motion.axis[1]);
        gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
      },
      resize(size) {
        if (canvas.width === size && canvas.height === size) return;
        canvas.width = size;
        canvas.height = size;
        gl.viewport(0, 0, size, size);
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

export const VERTEX_SHADER = `
precision highp float;
                  // uniforms
                  uniform vec2 resolution;
                  
                  // attributes
                  attribute vec3 position;
                  attribute float index;
                  attribute vec2 uv;

                  // varyings
                  varying float polyIndex;
                  varying vec2 vUv;
                  void main () {
                    vec2 normalizedCords = vec2(2, 2) * (position.xy / resolution);
                    vUv = uv;
                    polyIndex = index;
                    normalizedCords *= vec2(1, 1);
                    normalizedCords += vec2(-1, -1);
                    gl_Position = vec4(normalizedCords.xy, position.z, 1);
                  }
`;

export const FRAGMENT_SHADER = `
precision highp float;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// uniforms
uniform float pointilism;
uniform float gapSize;
uniform vec2 dotBounds;
uniform sampler2D colors;
uniform float colorSeed;
uniform float opacity;

// varyings
varying float polyIndex;
varying vec2 vUv;

mat2 getRotateMatByIndex (int index) {
  if (index == 0) {
    return mat2(0.707, -0.707, 0.707, 0.707);
  }
  if (index == 1) {
    return mat2(0.966, -0.259, 0.259, 0.966);
  }
  if (index == 2) {
    return mat2(0.966, 0.259, -0.259, 0.966);
  }
  return mat2(1.0);
}

float getDistance (int index) {
  vec2 cord = getRotateMatByIndex(index) * vUv;
  vec2 nearest = floor(cord / gapSize) * gapSize;
  float dist = length(cord - nearest);
  return dist; 
}

float getRadius (int index) {
  float random_offset = abs(snoise(vec2(float(index) + polyIndex)));
  float smooth_coeff = abs(snoise(vUv * pointilism * random_offset));
  float coeff = smooth_coeff;
  return mix(dotBounds[0], dotBounds[1], coeff);
}

void main () {
  if (vUv.x < 0.0 || vUv.x > 1.0 || vUv.y < 0.0 || vUv.y > 1.0) {
    discard;
  }
  int closestIndex = 0;
  float closestDistance = 1.0;
  for (int i = 0; i < 4; i++) {
    float d = getDistance(i);
    if (d < closestDistance) {
      closestIndex = i;
      closestDistance = d;
    }
  }
 
  float colorIndex = abs(snoise(vec2(colorSeed, polyIndex)));

  // float replaceColorIndex = abs(snoise(vec2(colorIndex, polyIndex)));

  // if (int(replaceColorIndex / 0.25) == closestIndex) {
  //   closestIndex = (closestIndex + 1) == 4 ? 0 : (closestIndex + 1);
  // }

  vec4 tintedColor = texture2D(colors, vec2(0.5, float(closestIndex) / 4.0 ));

  float radius = getRadius(closestIndex);
  
  vec4 color = texture2D(colors, vec2(0.5, colorIndex * 1.0 ));
  // background
  if (polyIndex == 0.0) {
    gl_FragColor = color; 
    // gl_FragColor = vec4(vUv.y, vUv.y, vUv.y, 1.0);
  } else {
    gl_FragColor = mix(tintedColor, color, step(radius, closestDistance));
  }
  gl_FragColor.a = opacity;
}
`;

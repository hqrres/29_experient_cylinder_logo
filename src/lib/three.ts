import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

// Import SRGBColorSpace
import { SRGBColorSpace } from 'three';

// Export everything
export { THREE, OrbitControls, SRGBColorSpace };
export { Stats };

// Export commonly used THREE types
export type {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Clock,
  Quaternion,
  Euler,
  Texture
} from 'three';

export default THREE; 
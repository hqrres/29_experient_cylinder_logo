import { THREE } from '@/lib/three';
import { OrbitControls } from '@/lib/three';
import { CylinderGeometry, MeshBasicMaterial, Mesh, TextureLoader, WebGLRenderTarget, Scene, PerspectiveCamera, PlaneGeometry, ShaderMaterial } from 'three';

export class Canvas {

  constructor(canvas) {
    console.log('Canvas constructor called');
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 1000);
    this.camera.position.z = 24;

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableZoom = true;

    this.renderTarget = new WebGLRenderTarget(512, 512);

    this.addCube();
    this.addRenderTargetScene();
    this.animate();
    this.handleResize();

  }

  addRenderTargetScene() {
    this.rtScene = new Scene();
    this.rtCamera = new PerspectiveCamera(35, 1, 0.1, 1000);
    this.rtCamera.position.z = 5;

    const rtGeometry = new PlaneGeometry(2, 2);
    const texture = new TextureLoader().load('/vt_logo_200x200_must.jpg');
    const rtMaterial = new MeshBasicMaterial({ map: texture });

    const rtMesh = new Mesh(rtGeometry, rtMaterial);
    rtMesh.position.x = 0.0; // Adjust this value to move the texture horizontally
    rtMesh.position.y = 0.0; // Adjust this value to move the texture vertically
    rtMesh.scale.set(1.6, 1.0, 1.0);
    this.rtScene.add(rtMesh);
  }

  addCube() {
    const geometry = new CylinderGeometry(5, 5, 10, 32, 1, true);

    // Define the shader material
    const material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: this.renderTarget.texture },
        numRows: { value: 1.0 },
        numCols: { value: 4.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float numRows;
        uniform float numCols;
        varying vec2 vUv;
        void main() {
          vec2 gridUV = fract(vUv * vec2(numCols, numRows));
          vec4 texColor = texture2D(uTexture, gridUV);
          gl_FragColor = texColor;
        }
      `,
    });

    this.cube = new Mesh(geometry, material);
    this.cube.rotation.x = Math.PI;
    this.cube.rotation.z = -Math.PI;
    this.scene.add(this.cube);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.orbitControls.update();

    // Render the render target scene to the render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.rtScene, this.rtCamera);
    this.renderer.setRenderTarget(null);

    // Render the main scene
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    window.addEventListener("resize", () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }
}

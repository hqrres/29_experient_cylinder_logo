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

    this.renderTarget1 = new WebGLRenderTarget(512, 512);
    this.renderTarget2 = new WebGLRenderTarget(512, 512);

    this.addCylinder();
    this.addRenderTargetScene1();
    this.addRenderTargetScene2();
    this.animate();
    this.handleResize();

  }

  addRenderTargetScene1() {
    this.rtScene1 = new Scene();
    this.rtCamera1 = new PerspectiveCamera(35, 1, 0.1, 1000);
    this.rtCamera1.position.z = 5;

    const rtGeometry1 = new PlaneGeometry(2, 2);
    const texture1 = new TextureLoader().load('/vt_logo_200x200_must.jpg');
    const rtMaterial1 = new MeshBasicMaterial({ map: texture1 });

    const rtMesh1 = new Mesh(rtGeometry1, rtMaterial1);
    rtMesh1.position.x = 0.0;
    rtMesh1.position.y = 0.0;
    rtMesh1.scale.set(1.6, 1.0, 1.0);
    this.rtScene1.add(rtMesh1);
  }

  addRenderTargetScene2() {
    this.rtScene2 = new Scene();
    this.rtCamera2 = new PerspectiveCamera(35, 1, 0.1, 1000);
    this.rtCamera2.position.z = 5;

    const rtGeometry2 = new PlaneGeometry(2, 2);
    const texture2 = new TextureLoader().load('/vt_logo_200x200_roh.jpg'); // Use a different texture
    const rtMaterial2 = new MeshBasicMaterial({ map: texture2 });

    const rtMesh2 = new Mesh(rtGeometry2, rtMaterial2);
    rtMesh2.position.x = 0.0;
    rtMesh2.position.y = 0.0;
    rtMesh2.scale.set(1.6, 1.0, 1.0);
    this.rtScene2.add(rtMesh2);
  }

  addCylinder() {
    const geometry = new CylinderGeometry(5, 5, 6, 32, 1, true);

    // Define the shader material for the larger cylinder
    const material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: this.renderTarget1.texture },
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

    this.cylinder = new Mesh(geometry, material);
    this.cylinder.rotation.x = Math.PI;
    this.cylinder.rotation.z = -Math.PI;
    this.scene.add(this.cylinder);

    // Add a second cylinder with a different render target texture on the inside
    const smallerGeometry = new CylinderGeometry(4.75, 4.75, 6, 32, 1, true);
    const smallerMaterial = new ShaderMaterial({
      uniforms: {
        uTexture: { value: this.renderTarget2.texture }, // Use the second render target texture
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
      side: THREE.BackSide // Render the texture on the inside
    });

    this.smallerCylinder = new Mesh(smallerGeometry, smallerMaterial);
    this.smallerCylinder.rotation.x = Math.PI;
    this.smallerCylinder.rotation.z = -Math.PI;
    this.scene.add(this.smallerCylinder);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.orbitControls.update();

    // Render the first render target scene to the first render target
    this.renderer.setRenderTarget(this.renderTarget1);
    this.renderer.render(this.rtScene1, this.rtCamera1);

    // Render the second render target scene to the second render target
    this.renderer.setRenderTarget(this.renderTarget2);
    this.renderer.render(this.rtScene2, this.rtCamera2);

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

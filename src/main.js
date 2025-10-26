import * as THREE from 'three';
import * as model from './model';

let currentMesh = null;
let currentRenderer = null;
let currentScene = null;

class Options {
    constructor(duration = 300, animation = true) {
        this.duration = duration;
        this.animation = animation;
        this.debug = debug;
    }
}


export async function show(modelSetFile) {
    let modelSet = await model.loadFile(modelSetFile);
    if (!modelSet) {
        console.error("No model set data available.");
        return;
    }

    console.log("Model Set Loaded:", modelSet.name);
   
    
    const width = window.innerWidth, height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
    camera.position.z = 1;

    
    const scene = new THREE.Scene();
    currentScene = scene;

    const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh( geometry, material );
    currentMesh = mesh;
    scene.add( mesh );

    
    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    currentRenderer = renderer;
    renderer.setSize( width, height );
    
    // Animation function
    function animate() {
        // if (options.animation && currentMesh) {
        //     currentMesh.rotation.x += 0.01;
        //     currentMesh.rotation.y += 0.02;
        // }
        
        if (currentRenderer && currentScene) {
            currentRenderer.render(currentScene, camera);
        }
    }
    
    renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );

    const axesHelper = new THREE.AxesHelper(0.5);
    scene.add(axesHelper);
}

// Export debug helpers
export function getDebugInfo() {
    return {
        mesh: currentMesh,
        renderer: currentRenderer,
        scene: currentScene
    };
}

export function stopAnimation() {
    if (currentRenderer) {
        currentRenderer.setAnimationLoop(null);
        console.log("Animation stopped");
    }
}
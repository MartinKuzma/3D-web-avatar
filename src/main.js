import * as THREE from 'three';
import * as model from './model';

let currentMesh = null;
let currentRenderer = null;
let currentScene = null;
let currentPointCloud = [];


export class Options {
    constructor(targetDOM, duration) {
        this.targetDOM = targetDOM; // DOM element to render into
        this.duration = duration; // Duration of the animation in seconds
    }
}

// function createQuadGeometry(size) {
//     const geometry = new THREE.BufferGeometry();
//     const halfSize = size / 2;

//     const vertices = new Float32Array([
//         -halfSize, -halfSize, 0,
//          halfSize, -halfSize, 0,
//          halfSize,  halfSize, 0,
//         -halfSize,  halfSize, 0
//     ]);

//     const indices = [
//         0, 1, 2,
//         2, 3, 0
//     ];
    
//     geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
//     geometry.setIndex(indices);
//     geometry.computeVertexNormals();
//     return geometry;
// }


export async function show(modelSetFile, options = null) {
    let modelSet = await model.loadFile(modelSetFile);
    if (!modelSet) {
        console.error("No model set data available.");
        return;
    }
   
    // Get target element and dimensions
    let targetElement = document.body;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    targetElement = options.targetDOM;
    const rect = targetElement.getBoundingClientRect();
    width = rect.width || targetElement.clientWidth;
    height = rect.height || targetElement.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(90, width / height, 0.01, 10 );
    camera.position.z = 5;

    const scene = new THREE.Scene();
    currentScene = scene;

    const geometry = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
    const material = new THREE.MeshNormalMaterial();

    const pointGeometry = new THREE.BufferGeometry();


    const vertices = new Float32Array( [
        -1.0, -1.0,  1.0, // v0
        1.0, -1.0,  1.0, // v1
        1.0,  1.0,  1.0, // v2
        1.0,  1.0,  1.0, // v3
        -1.0,  1.0,  1.0, // v4
        -1.0, -1.0,  1.0  // v5
    ]);


    pointGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    pointGeometry.setAttribute( 'color', new THREE.BufferAttribute( vertices, 3 ) );
    const material2 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );

    let points = new THREE.Points(pointGeometry, material2 );

    const mesh = new THREE.Mesh( geometry, material );
    currentMesh = mesh;
    //scene.add( mesh );
    scene.add( points );

    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor(0x000000, 0); // Set clear color, no alpha

    currentRenderer = renderer;
    renderer.setSize( width, height );
        
    function animate() {
        currentMesh.rotation.x += 0.01;
        currentMesh.rotation.y += 0.02;
        points.rotation.x += 0.01;
        points.rotation.y += 0.02;  
        
        
        if (currentRenderer && currentScene) {
            currentRenderer.render(currentScene, camera);
        }
    }
    
    renderer.setAnimationLoop( animate );
    targetElement.appendChild( renderer.domElement );



    // Add resize handler for responsive rendering
    // if (resizeHandler) {
    //     window.removeEventListener('resize', resizeHandler);
    // }
    let resizeHandler = () => handleResize(targetElement, camera, renderer);
    window.addEventListener('resize', resizeHandler);
}

// Helper function to create a new Options instance
export function createOptions(targetDOM, duration = 5) {
    return new Options(targetDOM, duration);
}

// // Helper function to show in a specific element by selector
// export async function showInElement(modelSetFile, elementSelector, duration = 5) {
//     const element = document.querySelector(elementSelector);
//     if (!element) {
//         console.error(`Element with selector "${elementSelector}" not found`);
//         return;
//     }
    
//     const options = new Options(element, duration);
//     return await show(modelSetFile, options);
// }

function handleResize(targetElement, camera, renderer) {
    let width, height;
    
    if (targetElement === document.body) {
        width = window.innerWidth;
        height = window.innerHeight;
    } else {
        const rect = targetElement.getBoundingClientRect();
        width = rect.width || targetElement.clientWidth;
        height = rect.height || targetElement.clientHeight;
    }
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
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
    
    // Clean up resize handler
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }
}
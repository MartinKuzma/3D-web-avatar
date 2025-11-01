import * as THREE from 'three';
import { HEXColor, Model, loadModel } from './model';
import * as TWEEN from '@tweenjs/tween.js';

export class Options {
    public renderTargetID: string = 'avatar-container';
    public backgroundColor: HEXColor = '#00000000';
    public rotateCamera: boolean = true;
    public rotateCameraSpeed: number = 0.25;
    public cameraDistance: number = 3;
    public pointScale: number = 0.025;
    public chanceOfFloatingPoint: number = 0.7;
    public maxPoints: number = 2000;
}


class Avatar3D {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private models : Model[] = [];
    private currentModelIndex: number = 0;
    private sprites : THREE.Sprite[] = [];
    private tweenGroup = new TWEEN.Group()
    private options: Options;

    constructor(models : Model[], options: Options) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setClearColor(new THREE.Color(0, 0, 0), 0);
        this.options = options;
        this.models = models;

        const container = document.getElementById(options.renderTargetID);
        if (!container) {
            throw new Error(`Container with ID '${options.renderTargetID}' not found.`);
        }


        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        // Determine the minimum number of points across all models for better transitions
        let numPoints = this.options.maxPoints;
        for( let model of this.models) {
            const modelPointsLen = model.getPoints().length;
             if (modelPointsLen < numPoints) {
                numPoints = modelPointsLen;
             }
        }

        for (let i = 0; i < numPoints; i++ ) {
            const spriteMaterial = new THREE.SpriteMaterial( { color: '#111111' } );
            const sprite = new THREE.Sprite( spriteMaterial );
            const scale = this.options.pointScale
            sprite.scale.set(scale, scale, scale);

            sprite.position.set(0, 0, 0);

            this.sprites.push(sprite);
            this.scene.add(sprite);
        }
    }

    // public async show(modelURL : string) {
    //       const container = document.getElementById('avatar-container');
    //     if (!container) {
    //         console.error(`Container with ID '${'avatar-container'}' not found.`);
    //         return;
    //     }
    //     this.renderer.setSize(container.clientWidth, container.clientHeight);
    //     container.appendChild(this.renderer.domElement);
    //     this.camera.position.z = 3;

    //     for (let i = 0; i < 25; i++) {
    //         let spriteMaterial = new THREE.SpriteMaterial({ color: '#FFFFFF' });
    //         let sprite = new THREE.Sprite(spriteMaterial);

    //         sprite.scale.set(0.05, 0.05, 0.05);

    //         sprite.position.set(
    //             Math.random() * 2.0 - 1.0, // x
    //             Math.random() * 2.0 - 1.0, // y
    //             Math.random(), // z - this will be set using depth data later
    //         );
    //         this.scene.add(sprite);
    //     }

    //     let animate = () => {
    //         this.renderer.render(this.scene, this.camera);
    //     };
    //     this.renderer.setAnimationLoop(animate);
    // }

    public async show() {
        this.camera.position.z = 3;
        this.changeModel(0);

        let clock = new THREE.Clock();        
        clock.start();
    
        let animate = (time : number)=> {
            this.tweenGroup.update(time);
            
            const radius = 3; // Distance from center (current camera.position.z)

            if (this.options.rotateCamera) {
                this.camera.position.x = radius * Math.sin(clock.getElapsedTime() * this.options.rotateCameraSpeed);
                this.camera.position.z = radius * Math.cos(clock.getElapsedTime() * this.options.rotateCameraSpeed);            
                this.camera.lookAt(0, 0, 0);
            }
    
            this.renderer.render(this.scene, this.camera);
        }
    
        this.renderer.setAnimationLoop( animate );
    }

    private changeModel(index : number) {
        if (index < 0 || index >= this.models.length) {
            console.error("Model index out of bounds.");
            return;
        }

        this.tweenGroup.removeAll();

        this.currentModelIndex = index;
        const model = this.models[index];

        for (let i = 0; i < this.sprites.length; i++ ) {
            const point = model.getPoints()[i];
            const sprite = this.sprites[i];
    
            let appearTween = new TWEEN.Tween( sprite.position)
                .to( {y: point.y, x: point.x, z: point.z}, 2000 )
                .easing( TWEEN.Easing.Exponential.Out )
                .delay( Math.random()*2000  + 1000) // Add random delay 0-1000ms
                .yoyo( false )
                .onComplete( () => {
                    this.tweenGroup.remove(appearTween);

                    if (Math.random() < this.options.chanceOfFloatingPoint) {
                        return;
                    }

                    let floatingTween = new TWEEN.Tween( sprite.position )
                        .to( { y: point.y + (Math.random()*0.1)}, Math.random() * 5000 + 1000 )
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .delay(10)
                        .yoyo(true)
                        .repeat(Infinity)
                        .start();
                    this.tweenGroup.add(floatingTween);  
                })
                .start();

            const targetSpriteMaterial = new THREE.SpriteMaterial( { color: point.color } );
            
            let colorTween = new TWEEN.Tween( sprite.material.color )
                .to( targetSpriteMaterial.color, 3000 )
                .easing(TWEEN.Easing.Quadratic.InOut)
                .delay(2000) // Add random delay 0-1000ms
                .yoyo(false)
                .start();
            
            this.tweenGroup.add(appearTween);            
            this.tweenGroup.add(colorTween);
        }
    }

    private cleanupScene() {
        this.tweenGroup.removeAll();
        this.scene.children = [];
        this.sprites = [];
    }

    private nextModel() {
        let nextIndex = (this.currentModelIndex + 1) % this.models.length;
        this.changeModel(nextIndex);
    }
}

export async function test() {
    let model = await loadModel("avatar-creator/sampled_depth_points_with_color.json");
    if (model == null) {
            console.error("Failed to load model.");
            return;
    }

    let avatar3d = new Avatar3D([model], new Options());
    avatar3d.show();
    console.log('Test function in TypeScript');
}
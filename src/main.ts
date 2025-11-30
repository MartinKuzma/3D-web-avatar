import { HEXColor, Model, loadModel, Point } from './model';
import { Options, defaultOptions } from './options';
import { RGBAColor } from './color';
import * as TWEEN from '@tweenjs/tween.js';
import { 
  Scene, 
  PerspectiveCamera, 
  WebGLRenderer, 
  SpriteMaterial, 
  Sprite, 
  Color,
  Clock
} from 'three';

class AvatarRenderer {
    private scene: Scene;
    private camera: PerspectiveCamera;
    private renderer: WebGLRenderer;
    private container: HTMLElement;
    private models : Model[] = [];
    private currentModelIndex: number = 0;
    private sprites : Sprite[] = [];
    private tweenGroup = new TWEEN.Group()
    private options: Options;

    private cameraTweenGroup = new TWEEN.Group()
    private cameraRotation = 0;

    constructor(models : Model[], options: Options) {
        this.options = {...defaultOptions, ...options};
        this.models = models;
        
        this.scene = new Scene();
        this.container = this.getRenderTarget(this.options.renderTargetID);
        this.camera = new PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);

        const backgroundColor = new Color(
            this.options.backgroundColor.r, 
            this.options.backgroundColor.g, 
            this.options.backgroundColor.b,
        )

        
        this.renderer = new WebGLRenderer({ alpha: true });
        this.renderer.setClearColor(
            backgroundColor, 
            this.options.backgroundColor.a,
        );

        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        // Determine the minimum number of points across all models for better transitions
        let numPoints = this.options.maxPoints;
        for( let model of this.models) {
            const modelPointsLen = model.getPoints().length;
             if (modelPointsLen < numPoints) {
                numPoints = modelPointsLen;
             }
        }

        // Create a sprite for each point with initial off-screen position
        for (let i = 0; i < numPoints; i++ ) {
            const spriteMaterial = new SpriteMaterial( {
                color: backgroundColor
            } );

            const sprite = new Sprite( spriteMaterial );
            const scale = this.options.pointScale
            sprite.scale.set(scale, scale, scale);
            sprite.position.set(0, -5, 0);

            this.sprites.push(sprite);
            this.scene.add(sprite);
        }
    }

    private getRenderTarget(id : string) : HTMLElement {
        const container = document.getElementById(id);
        if (!container) {
            throw new Error(`Container with ID '${id}' not found.`);
        }
        return container;
    }

    public async show() {
        this.camera.position.y = 0;
        this.camera.lookAt(0, 0, 0);
        this.camera.position.z = this.options.cameraDistance;
        this.changeModel(0);

        let clock = new Clock();        
        clock.start();

        let cameraClock = new Clock();
        cameraClock.start();

        this.cameraTweenGroup.removeAll();
    
        let animate = (time : number)=> {
            this.tweenGroup.update(time);

            if (clock.getElapsedTime() > this.options.nextModelIntervalSeconds) {
                this.nextModel();
                clock.start();
            }
            
            this.rotateCameraAroundModel(cameraClock.getDelta());    
            this.renderer.render(this.scene, this.camera);
        }
    
        this.renderer.setAnimationLoop( animate );
    }

    private rotateCameraAroundModel(deltaTime: number) {
        if (!this.options.rotateCamera) {
            return;
        }

        this.cameraRotation += this.options.rotateCameraSpeed * deltaTime;
        const radius = this.options.cameraDistance;

        this.camera.position.x = radius * Math.sin(this.cameraRotation);
        this.camera.position.z = radius * Math.cos(this.cameraRotation);
        this.camera.lookAt(0, 0, 0);
    }

    private changeModel(index : number) {
        if (index < 0 || index >= this.models.length) {
            console.error("Model index out of bounds.");
            return;
        }

        this.tweenGroup.removeAll();
        const model = this.models[index];
        const points = model.getPoints();
        this.currentModelIndex = index;

        for (let i = 0; i < this.sprites.length; i++ ) {
            const point = points[i];
            const sprite = this.sprites[i];
    
            // Tween the new position
            let appearTween = new TWEEN.Tween( sprite.position)
                .to( {y: point.y, x: point.x, z: point.z}, 2000 )
                .easing( TWEEN.Easing.Circular.Out )
                .delay( Math.random()*2000) // Add random delay 0-1000ms
                .yoyo( false )
                .onComplete( () => {
                    this.tweenGroup.remove(appearTween);
                    this.addFloatingAnimation(sprite, point);
                })
                .start();

            const targetSpriteMaterial = new SpriteMaterial( { color: point.color } );
            
            // Tween the new color
            let colorTween = new TWEEN.Tween( sprite.material.color )
                .to( targetSpriteMaterial.color, 2000 )
                .easing(TWEEN.Easing.Quadratic.InOut)
                .delay(1000) // Add random delay 0-1000ms
                .yoyo(false)
                .start();
            
            this.tweenGroup.add(appearTween);            
            this.tweenGroup.add(colorTween);
        }
    }

    private addFloatingAnimation(sprite : Sprite, point: Point) {
         if (Math.random() > this.options.chanceOfFloatingPoint) {
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
    }

    private cleanupScene() {
        this.tweenGroup.removeAll();
        this.scene.children = [];
        this.scene.clear();
        this.sprites = [];
        this.renderer.setAnimationLoop( null );
        this.renderer.dispose();
    }

    private nextModel() {
        let nextIndex = (this.currentModelIndex + 1) % this.models.length;
        this.changeModel(nextIndex);
    }
}

// Load multiple models from URLs and display them with given options.
// Any models that fail to load are skipped.
export async function showModels(modelURLs: string[], options: Options) {
    let models : Model[] = [];

    for (let url of modelURLs) {
        let model = await loadModel(url);
        if (model != null) {
            models.push(model);
        } else {
            console.error(`Failed to load model from URL: ${url}`);
        }
    }

    let avatar3d = new AvatarRenderer(models, options);
    avatar3d.show();
}
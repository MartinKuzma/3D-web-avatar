import { RGBAColor } from './color';


export class Options {
    // ID of the HTML element to render the scene into
    public renderTargetID: string = 'avatar-container';
    // Background color of the scene
    public backgroundColor: RGBAColor = new RGBAColor(0, 0, 0, 0);
    // Whether to rotate the camera around the model
    public rotateCamera: boolean = true;
    // Speed of camera rotation
    public rotateCameraSpeed: number = 0.25;
    // Distance of camera from center
    public cameraDistance: number = 1.5;
    // Scale of each point sprite
    public pointScale: number = 0.015;
    // Chance (0.0 - 1.0) of each point having a floating animation
    public chanceOfFloatingPoint: number = 0.7;
    // Maximum number of points to use from each model
    public maxPoints: number = 2000;
    // Time in seconds between model transitions
    public nextModelIntervalSeconds: number = 20;
}

export const defaultOptions = new Options();
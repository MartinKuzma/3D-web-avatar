export type HEXColor = `#${string}`;

export class Point {
    public x: number;
    public y: number;
    public z: number;

    public color: HEXColor;

    constructor(x: number, y: number, z: number, color: HEXColor) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.color = color;
    }
}

export class ModelSet {
    private models : Model[] = [];

    public addModel(model: Model) {
        this.models.push(model);
    }

    public getModels(): Model[] {
        return this.models;
    }
}

export class Model {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    private points : Point[] = [];

    public addPoint(point: Point) {
        this.points.push(point);
    }

    public getPoints(): Point[] {
        return this.points;
    }
}



export async function loadModel(modelURL: string) : Promise<Model | null> {
    try {
        const response = await fetch(modelURL);
        if (!response.ok) {
            throw new Error(`Failed to load model set file: ${response.statusText}`);
        }
        const pointsData = await response.json();

        let model = new Model("01");

        for (const pointData of pointsData) {
            const point = new Point(
                pointData.position[0],
                pointData.position[1],
                pointData.position[2],
                pointData.color
            );
            model.addPoint(point);
        }

        return model;
    } catch (error) {
        console.error("Error loading model file:", error);
        return null;
    }
}
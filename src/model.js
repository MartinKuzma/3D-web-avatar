class ModelSet {
    constructor(data) {
        this.name = data.name || "Unnamed Model Set";
        this.models = (data.models || []).map(modelData => new Model(modelData));
    }
}

class Model {
    constructor(data) {
        this.id = data.id || "unknown";
    }
}

async function loadModelSetFile(modelSetFile) {
    try {
        const response = await fetch(modelSetFile);
        if (!response.ok) {
            throw new Error(`Failed to load model set file: ${response.statusText}`);
        }
        const modelSetData = await response.json();

        const modelSet = new ModelSet(modelSetData);
        return modelSet;
    } catch (error) {
        console.error("Error loading model set file:", error);
        return null;
    }
}

export { Model, ModelSet, loadModelSetFile as loadFile };
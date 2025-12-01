# 3D avatar

This repository contains tools and code for creating and displaying pixelated 3D avatars from depth images.

## How to extract 3D points from depth images

```bash
# Navigate to the tools directory
cd tools
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
# Install required dependencies
pip install -r requirements.txt
# Run the HEIC export tool
python heic-export.py --input path/to/depth_image.heic --output path/to/output.json
```

## How to use the 3D avatar viewer
Build and run the viewer application:
```bash
# Install dependencies
npm install
# Start the development server
npm run build
```

Update your html file to include the generated library and use it to display the 3D avatar:
```html
<script src="path/to/generated/library.js"></script>
<script>
    const { showModels, RGBAColor } = window['3DAvatar'];

    const modelURLs = ["2.json", "3.json"];
    const options = {
            backgroundColor: new RGBAColor(0, 0, 0, 1),
            pointSize: 2,
            saturationLevel: 1.2,
    };

    showModels(modelURLs, options);
</script>
```

## Viewer options

The viewer supports the following options:
| Option             | Description                                      | Type    | Default     |
|--------------------|--------------------------------------------------|---------|-------------|
| `renderTargetID`   | ID of the DOM element where the renderer mounts  | string  | `avatar-container` |
| `backgroundColor`  | Scene background color (hex string)              | string  | `#00000000` |
| `rotateCamera`     | Enable automatic camera orbit                    | boolean | `true` |
| `rotateCameraSpeed`| Orbit angular speed (radians/sec)                | number  | `0.25` |
| `cameraDistance`   | Distance between camera and model center         | number  | `1.5` |
| `pointScale`       | Sprite scale applied to every point              | number  | `0.015` |
| `chanceOfFloatingPoint` | Probability a point gets floating animation | number  | `0.7` |
| `maxPoints`        | Upper bound on sampled points rendered per model | number  | `2000` |
| `nextModelIntervalSeconds` | Seconds before cycling to the next model | number  | `20` |

### Tools

See the [tools/README.md](tools/README.md) for instructions on using the provided tools to extract 3D points from depth images.
# 3D avatar Tools

## Installation

To install the required dependencies, create a virtual environment and run:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

## HEIC export
Use HEIC Export to extract 3D points from depth images.

### Usage

```bash
# Basic usage
python heic-export.py --input input.heic --output output.json

# With additional options
python heic-export.py --input photo.heic --output points.json --samples 1000 --min-depth 50 --max-depth 200

# With cropping
python heic-export.py --input photo.heic --output points.json --crop 100 200 800 600

# Show help
python heic-export.py --help
```

### Options

Table of available options:
| Option              | Description                                         | Type    | Default | Required |
|---------------------|-----------------------------------------------------|---------|---------|----------|
| `--input`           | Input HEIC file path                                | string  | -       | Yes      |
| `--output`          | Output JSON file path                               | string  | -       | Yes      |
| `--min-depth`       | Minimum depth value to consider                     | int     | 0       | No       |
| `--max-depth`       | Maximum depth value to consider                     | int     | 255     | No       |
| `--crop`            | Crop box for the image (X Y WIDTH HEIGHT)           | int[4]  | -       | No       |
| `--samples`         | Number of 3D points to sample                       | int     | 600     | No       |
| `--show-histogram`  | Show a depth histogram before sampling              | bool    | False   | No       |
| `--tint-color`      | Apply an RGB tint to sampled colors (R G B)         | int[3]  | -       | No       |
| `--saturation-level`| Adjust saturation multiplier for sampled colors     | float   | 1.0     | No       |
| `--cut-circle`      | Keep only points within radius from the origin      | float   | -       | No       |


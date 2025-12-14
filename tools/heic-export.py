import sys
from PIL import Image
import pillow_heif
import numpy as np
import json
import argparse

def main():
    # parse arguments and call functions
    parser = argparse.ArgumentParser(
        description="HEIC Exporter to extract 3D points from depth images",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="",
    )
    
    # Required arguments
    parser.add_argument(
        "--input",
        type=str,
        required=True,
        help="Input HEIC file path (required)"
    )
    parser.add_argument(
        "--output",
        type=str,
        required=True,
        help="Output JSON file path (required)"
    )
    
    # depth boundaries
    parser.add_argument(
        "--min-depth",
        type=int,
        default=0,
        help="Minimum depth value to consider (default: 0)"
    )
    parser.add_argument(
        "--max-depth",
        type=int,
        default=255,
        help="Maximum depth value to consider (default: 255)"
    )
    
    # crop box 
    parser.add_argument(
        "--crop",
        type=int,
        nargs=4,
        metavar=('X', 'Y', 'WIDTH', 'HEIGHT'),
        help="Crop box for the image (optional)"
    )
    
    # Number of samples
    parser.add_argument(
        "--samples",
        type=int,
        default=600,
        help="Number of 3D points to sample (default: 600)"
    )
    
    parser.add_argument(
        "--show-histogram",
        type=bool,
        default=False,
        help="Show depth histogram (default: False)"
    )
    # Tint color
    parser.add_argument(
        "--tint-color",
        type=int,
        default=None,
        nargs=3,
        metavar=('R', 'G', 'B'),
        help="Tint color in RGB int format (optional)"
    )
    
    # Saturation level
    parser.add_argument(
        "--saturation-level",
        type=float,
        default=1.0,
        help="Saturation level for colors (default: 1.0)"
    )
    
    # Cut circle out of sampled points
    parser.add_argument(
        "--cut-circle",
        type=float,
        default=None,
        help="Cut circle radius from center (optional)"
    )
    
    parser.add_argument(
        "--custom-scale-z",
        type=float,
        default=1.0,
        help="Custom Z scale factor (default: 1.0)"
    )
        
    args = parser.parse_args()
    export_model(args)

def export_model(args):
    heif_file = pillow_heif.open_heif(args.input, convert_hdr_to_8bit=False)
    
    # crop_size = 3200
    # start_x = 300
    # start_y = 1500
    images = list_images(heif_file)
    if not images:
        print("No depth images found in HEIC file.")
        return
    
    print(f"Depth images found: {len(images)}")
    print("Taking the first depth image for processing.")
    
    image = images[0]
    
    # Convert to PIL Image and save cropped version
    img_orig = image.original.to_pillow()
    img_depth = image.depth.to_pillow().resize(img_orig.size)
    
    if crop_box := create_crop_box(args):
        print(f"Cropping images to box: {crop_box}")
        img_orig = img_orig.crop(crop_box)
        img_depth = img_depth.crop(crop_box)
        #pil_cropped.save("cropped_image.png")
    
    
    min_depth = args.min_depth
    max_depth = args.max_depth
    if min_depth >= max_depth:
        raise ValueError("min-depth must be less than max-depth")
    
    depth_data = np.array(img_depth)
    
    if args.show_histogram:
        print_depth_histogram(depth_data)

    sampled_points = sample_random_values(depth_data, args.samples, min_val=min_depth, max_val=max_depth)
    
                
    colors = img_orig.getdata()
    point_colors = []
    for point in sampled_points:
        px = int(point[0])
        py = int(point[1])
        color = colors[(py * img_orig.width) + px]            
        point_colors.append((color[0], color[1], color[2]))
    
    if args.tint_color:
        print(f"Applied tint color: {args.tint_color}")
        tint_rgb = args.tint_color
        
        for idx, color in enumerate(point_colors):
            tinted_color = (
                int((color[0] + tint_rgb[0]) / 2),
                int((color[1] + tint_rgb[1]) / 2),
                int((color[2] + tint_rgb[2]) / 2)
            )
            point_colors[idx] = tinted_color
    
    if args.saturation_level != 1.0:
        print(f"Adjusting saturation level: {args.saturation_level}")
        for idx, color in enumerate(point_colors):
            gray = int((color[0] + color[1] + color[2]) / 3)
            saturated_color = (
                int(gray + (color[0] - gray) * args.saturation_level),
                int(gray + (color[1] - gray) * args.saturation_level),
                int(gray + (color[2] - gray) * args.saturation_level)
            )
            point_colors[idx] = saturated_color
  
    sampled_points = normalize_sampled_points(sampled_points, img_orig.width, img_orig.height, args.custom_scale_z)
    
    if args.cut_circle:
        print(f"Cutting circle with radius: {args.cut_circle}")
        filtered_points = []
        filtered_colors = []
        for idx, point in enumerate(sampled_points):
            dist = np.sqrt( (point[0])**2 + (point[1])**2 )
            if dist <= args.cut_circle:
                filtered_points.append(point)
                filtered_colors.append(point_colors[idx])
        
        sampled_points = np.array(filtered_points)
        point_colors = filtered_colors
        print(f"Points remaining after cut: {len(sampled_points)}")

    # Export to json with hex color 
    json_points = []
    for point_idx, point in enumerate(sampled_points):
        color = point_colors[point_idx]
        hex_color = '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2])
        json_points.append({
            "p" : [point[0], point[1], point[2]],
            "c": hex_color
        })
    
    with open(args.output, 'w') as f:
        json.dump(json_points, f, indent=None)
        print (f"Exported {len(json_points)} points to {args.output}")
    

class ImageData:
    def __init__(self, original, depth):
        self.original = original
        self.depth = depth

def list_images(heif_file) -> list[ImageData]:
    depth_images = []
    for img in heif_file:
        for depth_img in img.info["depth_images"]:
            depth_images.append(ImageData(original=img, depth=depth_img))
            
    return depth_images

def create_crop_box(args):
    if args.crop:
        x, y, width, height = args.crop
    else:
        return None
    return (x, y, x + width, y + height)

def normalize_sampled_points(sampled_points, img_width, img_height, custom_scale_z=1.0):
    # Normalize points to -0.5 to 0.5 range
    aspect_ratio = img_width / img_height
    sampled_points[:, 0] = (sampled_points[:, 0] / img_width * aspect_ratio) - 0.5
    sampled_points[:, 1] = (sampled_points[:, 1] / img_height) - 0.5
    
    min_z = np.min(sampled_points[:, 2])
    max_z = np.max(sampled_points[:, 2])
    move_z = ((max_z + min_z) / 2.0) / max_z
    
    sampled_points[:, 2] = ((sampled_points[:, 2]) / max_z) - move_z
    sampled_points[:, 2] = sampled_points[:, 2] * custom_scale_z
    
    # Center points around origin
    avg_x = np.average(sampled_points[:,0])
    avg_y = np.average(sampled_points[:,1])
    sampled_points[:,0] = sampled_points[:,0] - avg_x
    sampled_points[:,1] = sampled_points[:,1] - avg_y

    # Invert axis for correct orientation
    sampled_points[:, 1] *= -1.0
    
    return sampled_points

def print_depth_histogram(depth_array):
    buckets = [0] * 20
    flattened = depth_array.flatten()
    
    for i in flattened:
        bucket_idx = int(i / 256 * len(buckets))
        if bucket_idx >= len(buckets):
            bucket_idx = len(buckets) - 1
        
        buckets[bucket_idx] += 1
    
    # find max count for scaling
    max_count = max(buckets)
    
    print("Depth Histogram:")
    for idx, count in enumerate(buckets):
        start = int(idx / len(buckets) * 256)
        end = int((idx + 1) / len(buckets) * 256)
        bar_length = int((count / max_count) * 50)
        bar_empty = 50 - bar_length
        print(f"{start:3} - {end:3}  [{'|'*bar_length}{' '*bar_empty}]  {count}")
    
        
def sample_random_values(depth_array, num_samples, min_val=0, max_val=255):
    all_samples = np.array([]).reshape(0,3)
    
    attempts = 0
    
    while len(all_samples) < num_samples and attempts < 10:
        attempts += 1
        
        x_samples = np.random.uniform(low=0, high=depth_array.shape[1], size=num_samples)
        y_samples = np.random.uniform(low=0, high=depth_array.shape[0], size=num_samples)
        z_samples = depth_array[y_samples.astype(int), x_samples.astype(int)]
        
        sampled_values = np.vstack((x_samples, y_samples, z_samples)).T
        
        # Filter samples based on depth range
        sampled_values = sampled_values[ (sampled_values[:,2] >= min_val) & (sampled_values[:,2] <= max_val) ]
        sampled_values = sampled_values[:num_samples]  # Limit to requested number of samples
        
        # Ensure samples are not too close to existing samples
        # TODO: Optimize this for performance by using spatial partitioning
        for point in sampled_values:
            dists = np.sqrt( np.sum( (all_samples - point)**2, axis=1) )
            close_points = np.where( (dists < 2.0) & (dists > 0.0) )[0]
            if len(close_points) == 0:
                all_samples = np.append(all_samples, [point], axis=0)

    return all_samples[:num_samples]
    
if __name__ == "__main__":
    sys.exit(main())
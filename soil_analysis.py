import cv2
import numpy as np


def analyze_soil_image(image_path):

    image = cv2.imread(image_path)

    if image is None:
        return None

    # Resize image
    image = cv2.resize(image, (300, 300))

    # Convert to HSV
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Calculate average values
    brightness = np.mean(hsv[:, :, 2])
    saturation = np.mean(hsv[:, :, 1])

    # Estimate soil condition
    if brightness < 90 and saturation > 50:
        condition = "Dark and nutrient-rich soil"
        moisture = "High"
        soil_type = "Rich Loamy Soil"

        nitrogen = 75
        phosphorus = 45
        potassium = 68
        ph = 6.7

    elif brightness < 140:
        condition = "Moderately moist soil"
        moisture = "Medium"
        soil_type = "Loamy Soil"

        nitrogen = 60
        phosphorus = 35
        potassium = 55
        ph = 6.3

    else:
        condition = "Dry soil"
        moisture = "Low"
        soil_type = "Sandy Soil"

        nitrogen = 42
        phosphorus = 24
        potassium = 38
        ph = 5.8

    return {
        "condition": condition,
        "moisture": moisture,
        "soil_type": soil_type,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "ph": ph
    }
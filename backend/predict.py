import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import json
import os
import traceback

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model ONCE
model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
model.eval()
model.to(device)

# Load labels (LIST)
LABELS_PATH = os.path.join(os.path.dirname(__file__), "imagenet_labels.json")
with open(LABELS_PATH, "r") as f:
    imagenet_labels = json.load(f)

# Transform
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

CAT_KEYWORDS = [
    "cat", "kitten", "tabby", "persian", "siamese",
    "egyptian mau", "bengal", "maine coon",
    "british shorthair", "abyssinian", "ragdoll",
    "sphynx", "birman", "bombay"
]

DOG_KEYWORDS = [
    "dog", "puppy", "retriever", "shepherd",
    "terrier", "poodle", "husky", "beagle",
    "bulldog", "labrador", "golden retriever",
    "german shepherd", "doberman", "rottweiler",
    "pomeranian", "chihuahua", "dalmatian"
]

def predict_image(image_path):
    try:
        # Load & preprocess image
        image = Image.open(image_path).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(image)
            probs = F.softmax(output, dim=1)
            confidence, idx = torch.max(probs, 1)

        label = imagenet_labels[idx.item()]
        confidence = round(confidence.item() * 100, 2)
        label_lower = label.lower()

        # CAT
        if any(word in label_lower for word in CAT_KEYWORDS):
            return {
                "result": "🐱 Cat",
                "confidence": confidence,
                "label": label
            }

        # DOG
        if any(word in label_lower for word in DOG_KEYWORDS):
            return {
                "result": "🐶 Dog",
                "confidence": confidence,
                "label": label
            }

        # LOW CONFIDENCE
        if confidence < 20:
            return {
                "result": "🤔 Not sure",
                "confidence": confidence,
                "label": label
            }

        # OTHER OBJECT
        return {
            "result": "❌ Not a Cat or Dog",
            "confidence": confidence,
            "label": label
        }

    except Exception as e:
        # 🔥 NEVER FAIL SILENTLY AGAIN
        print("❌ Prediction error:")
        traceback.print_exc()

        return {
            "result": "❌ Prediction Failed",
            "confidence": 0,
            "label": "Error"
        }

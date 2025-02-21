import os
from dotenv import load_dotenv
import gdown
import re

# Load environment variables from .env file
load_dotenv()

# Get the Google Drive folder URL from the .env file
folder_url = os.getenv("GOOGLE_DRIVE_FOLDER_URL_FOR_PROJECT")
if not folder_url:
    raise ValueError("GOOGLE_DRIVE_FOLDER_URL is not set in the .env file.")

# Extract the folder ID from the URL
folder_id_match = re.search(r'folders/([\w-]+)', folder_url)
if not folder_id_match:
    raise ValueError("Invalid Google Drive folder URL. Could not extract folder ID.")
folder_id = folder_id_match.group(1)

# Specify the output directory for the folder
output_dir = "programTemplates"
os.makedirs(output_dir, exist_ok=True)

# Use gdown to download the folder
try:
    gdown.download_folder(f"https://drive.google.com/drive/folders/{folder_id}", quiet=False, output=output_dir)
    print(f"Folder downloaded successfully to {output_dir}")
except Exception as e:
    print(f"An error occurred: {e}")

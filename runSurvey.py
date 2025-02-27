import os
import subprocess
import argparse
from json_utils import update_success_json
from json_utils import proceed_only_on_success
from json_utils import terminatingMessage
json_file = "success.json"

update_success_json(json_file, "runSurvey", "true")

parser = argparse.ArgumentParser()
parser.add_argument("--env", choices=["local", "dev", "prod"], help="Specify the environment")
args = parser.parse_args()
env = args.env
print(f"Running in {args.env} environment")

# Directory containing the ProjectTemplate files
project_template_dir = './programTemplates_survey_service'  # Update this path if the files are in a different directory

# Get all .xlsx files in the directory
survey_files = [file for file in os.listdir(project_template_dir) if file.endswith(".xlsx")]

result = proceed_only_on_success(json_file, "DropSurveyCollection")
if result != True:
   update_success_json(json_file, "runSurvey", "false")
   terminatingMessage("Deletion of survey data failed hence not proceeding with runSurvey script...")

if not survey_files:
    print("No .xlsx files found in the directory.")
else:
    for project_file in survey_files:
        command = [
            "python3",
            "samikshaService.py",
            "--env", env,
            "--programFile", os.path.join(project_template_dir, project_file)
        ]
        print(f"Running command: {' '.join(command)}")
        try:
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error while running {project_file}: {e}")

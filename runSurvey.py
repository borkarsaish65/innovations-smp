import os
import subprocess
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--env", choices=["local", "dev", "prod"], help="Specify the environment")
args = parser.parse_args()
env = args.env
print(f"Running in {args.env} environment")

# Directory containing the ProjectTemplate files
project_template_dir = './programTemplates_survey_service'  # Update this path if the files are in a different directory

# Get all .xlsx files in the directory
survey_files = [file for file in os.listdir(project_template_dir) if file.endswith(".xlsx")]

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

import os
import subprocess
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--env", choices=["local", "dev", "prod"], help="Specify the environment")
args = parser.parse_args()
env = args.env
print(f"Running in {args.env} environment")


# Directory containing the ProjectTemplate files
project_template_dir = './programTemplates'  # Update this path if the files are in a different directory

# Get all .xlsx files in the directory
project_files = [file for file in os.listdir(project_template_dir) if file.endswith(".xlsx")]

if not project_files:
    print("No .xlsx files found in the directory.")
else:
    for project_file in project_files:
        command = [
            "python3",
            "projectService.py",
            "--env", env,
            "--projectFile", os.path.join(project_template_dir, project_file)
        ]
        print(f"Running command: {' '.join(command)}")
        try:
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error while running {project_file}: {e}")

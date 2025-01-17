import os
import subprocess

# Directory containing the ProjectTemplate files
project_template_dir = './Templates'  # Update this path if the files are in a different directory

# Get all files in the directory that match the pattern ProgramTemplate*.xlsx
project_files = [file for file in os.listdir(project_template_dir) if file.startswith("ProgramTemplate") and file.endswith(".xlsx")]

if not project_files:
    print("No ProgramTemplate files found.")
else:
    for project_file in project_files:
        command = [
            "python3",
            "projectService.py",
            "--env", "dev",
            "--programFile", os.path.join(project_template_dir, project_file)
        ]
        print(f"Running command: {' '.join(command)}")
        try:
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error while running {project_file}: {e}")

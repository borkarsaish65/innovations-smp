import os
import subprocess
import csv
import shlex
import argparse
from json_utils import update_success_json
from json_utils import proceed_only_on_success
from json_utils import terminatingMessage
json_file = "success.json"

update_success_json(json_file, "runMentoring", "true")


parser = argparse.ArgumentParser()
parser.add_argument("--env", choices=["local", "dev", "prod"], help="Specify the environment")
args = parser.parse_args()
env = args.env
print(f"Running in {args.env} environment")

project_template_dir = './MentroingTemplates'
log_file = "MentoringDetails.csv"
debug_log = "debug_log.txt"

project_files = [file for file in os.listdir(project_template_dir) if file.endswith(".xlsx")]

result = proceed_only_on_success(json_file, "deleteMentoringData")
if result != True:
   update_success_json(json_file, "runMentoring", "false")
   terminatingMessage("Deletion of mentoring data failed hence not proceeding with runMentoring script....")


if not project_files:
    print("No .xlsx files found in the directory.")
else:
    results = []
    with open(debug_log, "w") as debug_file:
        for project_file in project_files:
            file_path = os.path.join(project_template_dir, project_file)
            command = f'python3 mentoringScript.py --env {env} --MentoringFile "{file_path}"'

            print(f"Running command: {command}")
            try:
                result = subprocess.run(
                    command, shell=True, capture_output=True, text=True, check=True
                )

                # Print output and errors for debugging
                print(f"Output: {result.stdout.strip()}")
                print(f"Error: {result.stderr.strip()}")

                debug_file.write(f"Output for {project_file}:\n{result.stdout}\n{result.stderr}\n\n")

                # Check for success message
                status = "Success" if "Execution time in sec" in result.stdout else "Fail"
            except subprocess.CalledProcessError as e:
                error_message = f"Error while running {project_file}: {e}\n{e.stderr}\n"
                print(error_message)
                debug_file.write(error_message + "\n")
                status = "Fail"

            results.append([project_file, status])

    # Write results to CSV file
    with open(log_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Template Name", "Status"])
        writer.writerows(results)

    print(f"Execution log saved to {log_file}")
    print(f"Debug log saved to {debug_log}")

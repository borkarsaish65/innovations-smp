import os
import subprocess
import csv
import shlex

project_template_dir = './MentroingTemplates'
log_file = "MentoringDetails.csv"
debug_log = "debug_log.txt"

project_files = [file for file in os.listdir(project_template_dir) if file.endswith(".xlsx")]

if not project_files:
    print("No .xlsx files found in the directory.")
else:
    results = []
    with open(debug_log, "w") as debug_file:
        for project_file in project_files:
            file_path = os.path.join(project_template_dir, project_file)
            command = f'python3 mentoringScript.py --env dev --MentoringFile "{file_path}"'

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

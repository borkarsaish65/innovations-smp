const fs = require('fs');
const path = require('path');

const folders = ['MentoringDataCSV', 'MentroingTemplates', 'programFiles','programTemplates','programTemplates_survey_service']; // Folder names
const filesToDelete = ['surveyDetails.csv', 'projectDetails.csv', 'MentoringDetails.csv']; // Example file names to delete


const manageFolders = (folderNames) => {
    folderNames.forEach(folder => {
        const folderPath = path.resolve(__dirname, folder);

        if (fs.existsSync(folderPath)) {
            // Delete all files and subdirectories inside the folder
            fs.readdirSync(folderPath).forEach(file => {
                const filePath = path.join(folderPath, file);
                
                if (fs.statSync(filePath).isDirectory()) {
                    // Remove subdirectory
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    // Remove file
                    fs.unlinkSync(filePath);
                }
            });
            console.log(`Cleared all files in: ${folderPath}`);
        } else {
            // Create the folder if it doesn't exist
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`Created folder: ${folderPath}`);
        }
    });
};

// Function to delete specific files from the root directory
const deleteFiles = (fileNames) => {
    fileNames.forEach(fileName => {
        const filePath = path.resolve(__dirname, fileName);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } else {
            console.log(`File not found: ${filePath}`);
        }
    });
};

// Execute folder management
manageFolders(folders);
deleteFiles(filesToDelete);
fs.writeFileSync('success.json', '{}', 'utf8'); // Clears the file by writing an empty object


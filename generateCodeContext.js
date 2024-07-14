const fs = require('fs');
const path = require('path');

// Function to read the content of a file
const readFileContent = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

// Function to recursively get all files in a directory, excluding specific ones
const getAllFiles = (dirPath, arrayOfFiles = [], fileTypes = [], excludeFiles = []) => {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory() && file !== 'node_modules') {
            getAllFiles(fullPath, arrayOfFiles, fileTypes, excludeFiles);
        } else if (stats.isFile() && fileTypes.some(type => fullPath.endsWith(type)) && !excludeFiles.includes(file)) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
};

// Function to generate the code context and save it to a .txt file
const generateCodeContext = async (dirPath, outputFilePath) => {
    const frontendFileTypes = ['.js', '.jsx', '.ts', '.tsx']; // Adjust as needed
    const backendFileTypes = ['.js', '.ts']; // Adjust as needed

    // Exclude certain files from being included
    const excludeFiles = ['package.json', 'vite.config.js', 'generateCodeContext.js', 'codeContext.txt'];

    const frontendFiles = getAllFiles(dirPath, [], frontendFileTypes, excludeFiles);
    const backendFiles = getAllFiles(dirPath, [], backendFileTypes, excludeFiles);

    let codeContext = '';

    codeContext += 'Frontend Code Context:\n';
    codeContext += '*******************\n';
    for (const file of frontendFiles) {
        const content = await readFileContent(file);
        codeContext += `\n// File: ${file}\n\n${content}`;
    }

    codeContext += '\n\n*******************\n\n';

    codeContext += 'Backend Code Context:\n';
    codeContext += '*******************\n';
    for (const file of backendFiles) {
        const content = await readFileContent(file);
        codeContext += `\n// File: ${file}\n\n${content}`;
    }

    fs.writeFileSync(outputFilePath, codeContext, 'utf8');
    console.log(`Code context generated and saved to ${outputFilePath}`);
};

// Use the current directory and specify the output file path
const directoryPath = process.cwd(); // Current working directory
const outputPath = path.join(directoryPath, 'codeContext.txt');

// Generate the code context
generateCodeContext(directoryPath, outputPath).catch((err) => console.error(err));

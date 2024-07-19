import { promises as fs } from 'fs'; // Use fs.promises for async/await
import path from 'path';

// Function to read the content of a file
const readFileContent = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data;
    } catch (err) {
        throw err;
    }
};

// Function to recursively get all files in a directory, excluding specific ones
const getAllFiles = async (dirPath, arrayOfFiles = [], fileTypes = [], excludeFiles = []) => {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory() && file !== 'node_modules') {
            await getAllFiles(fullPath, arrayOfFiles, fileTypes, excludeFiles);
        } else if (stats.isFile() && fileTypes.some(type => fullPath.endsWith(type)) && !excludeFiles.includes(file)) {
            arrayOfFiles.push(fullPath);
        }
    }

    return arrayOfFiles;
};

// Function to generate the code context and save it to a .txt file
const generateCodeContext = async (dirPath, outputFilePath) => {
    const frontendFileTypes = ['.js', '.jsx', '.ts', '.tsx']; // Adjust as needed
    const backendFileTypes = ['.js', '.ts']; // Adjust as needed

    // Exclude certain files from being included
    const scriptFileName = path.basename(process.argv[1]); // Get the name of the current script file
    const excludeFiles = ['package.json', 'vite.config.js', 'codeContext.txt', scriptFileName];

    const frontendFiles = await getAllFiles(dirPath, [], frontendFileTypes, excludeFiles);
    const backendFiles = await getAllFiles(dirPath, [], backendFileTypes, excludeFiles);

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

    await fs.writeFile(outputFilePath, codeContext, 'utf8');
    console.log(`Code context generated and saved to ${outputFilePath}`);
};

// Use the current directory and specify the output file path
const directoryPath = process.cwd(); // Current working directory
const outputPath = path.join(directoryPath, 'codeContext.txt');

// Generate the code context
generateCodeContext(directoryPath, outputPath).catch((err) => console.error(err));

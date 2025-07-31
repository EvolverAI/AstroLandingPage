#!/usr/bin/env node

/**
 * Image Path Checker
 * This script checks if all image paths referenced in the components actually exist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const publicDir = path.join(__dirname, '..', 'public');
const srcDir = path.join(__dirname, '..', 'src');

// Function to extract image paths from files
function extractImagePaths(content) {
    const patterns = [
        /backgroundImage[:\s]*["']([^"']+)["']/g,
        /src[:\s]*["']([^"']+\.(jpg|jpeg|png|gif|webp|svg|ico))["']/gi,
        /url\(['"]([^'"]+\.(jpg|jpeg|png|gif|webp|svg|ico))['"]?\)/gi,
        /["']([^"']*\/img\/[^"']+)["']/g
    ];

    const paths = new Set();

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const imagePath = match[1];
            if (imagePath && !imagePath.startsWith('http')) {
                paths.add(imagePath);
            }
        }
    });

    return Array.from(paths);
}

// Function to check if file exists
function checkImageExists(imagePath) {
    // Remove leading slash and resolve to public directory
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const fullPath = path.join(publicDir, cleanPath);
    return fs.existsSync(fullPath);
}

// Function to scan directory for component files
function scanDirectory(dir, extensions = ['.astro', '.js', '.ts']) {
    const files = [];

    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);

        items.forEach(item => {
            const itemPath = path.join(currentDir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                scan(itemPath);
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push(itemPath);
            }
        });
    }

    scan(dir);
    return files;
}

// Main function
function checkImagePaths() {
    console.log('🔍 Checking image paths in Astro project...\n');

    const componentFiles = scanDirectory(srcDir);
    const imagePaths = new Set();
    const issues = [];

    // Extract all image paths from component files
    componentFiles.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const paths = extractImagePaths(content);

            paths.forEach(imagePath => {
                imagePaths.add(imagePath);

                if (!checkImageExists(imagePath)) {
                    issues.push({
                        file: path.relative(process.cwd(), filePath),
                        imagePath,
                        status: 'missing'
                    });
                }
            });

        } catch (error) {
            console.error(`❌ Error reading file ${filePath}:`, error.message);
        }
    });

    // Report results
    console.log(`📊 Found ${imagePaths.size} unique image references:\n`);

    Array.from(imagePaths).sort().forEach(imagePath => {
        const exists = checkImageExists(imagePath);
        const status = exists ? '✅' : '❌';
        console.log(`${status} ${imagePath}`);
    });

    if (issues.length > 0) {
        console.log(`\n⚠️  Found ${issues.length} issues:\n`);
        issues.forEach(issue => {
            console.log(`❌ ${issue.file}: ${issue.imagePath} (${issue.status})`);
        });
    } else {
        console.log('\n🎉 All image paths are valid!');
    }

    // List available images in public/img
    const imgDir = path.join(publicDir, 'img');
    if (fs.existsSync(imgDir)) {
        console.log('\n📁 Available images in /public/img:');
        const availableImages = fs.readdirSync(imgDir)
            .filter(file => /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(file))
            .sort();

        availableImages.forEach(image => {
            console.log(`   /img/${image}`);
        });
    }
}

// Run the check
checkImagePaths();

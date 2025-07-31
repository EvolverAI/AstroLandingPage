// Utility function to handle image paths correctly in both dev and production
// This ensures images from /public are properly resolved

/**
 * Resolves image paths to work correctly in both development and production
 * @param imagePath - The image path (e.g., "/img/company-bg.jpg" or "img/company-bg.jpg")
 * @returns Properly formatted image path
 */
export function resolveImagePath(imagePath) {
    // If the path already starts with /, it's already absolute from public
    if (imagePath.startsWith('/')) {
        return imagePath;
    }

    // If it doesn't start with /, add the leading slash
    return `/${imagePath}`;
}

/**
 * Get the base URL for the site (useful for production deployments)
 * @returns The base URL from Astro config or empty string for root deployment
 */
export function getBaseUrl() {
    // In Astro, import.meta.env.BASE_URL gives us the configured base
    return import.meta.env.BASE_URL || '/';
}

/**
 * Resolve image path with base URL consideration
 * @param imagePath - The image path
 * @returns Full path including base URL if needed
 */
export function resolveImagePathWithBase(imagePath) {
    const baseUrl = getBaseUrl();
    const resolvedPath = resolveImagePath(imagePath);

    // If base URL is just '/', return the path as-is
    if (baseUrl === '/') {
        return resolvedPath;
    }

    // Otherwise, combine base URL with the path
    return `${baseUrl.replace(/\/$/, '')}${resolvedPath}`;
}

/**
 * Check if an image path is external (http/https)
 * @param imagePath - The image path to check
 * @returns True if external, false if local
 */
export function isExternalImage(imagePath) {
    return imagePath.startsWith('http://') || imagePath.startsWith('https://');
}

/**
 * Comprehensive image path resolver that handles all cases
 * @param imagePath - The image path
 * @returns Properly resolved image path
 */
export function resolveImage(imagePath) {
    // If external image, return as-is
    if (isExternalImage(imagePath)) {
        return imagePath;
    }

    // For local images, resolve with base URL
    return resolveImagePathWithBase(imagePath);
}

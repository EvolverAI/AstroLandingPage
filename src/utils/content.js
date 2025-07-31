/**
 * Enhanced content management utilities for Astro Content Collections
 * Note: This file provides helper functions, but the actual astro:content imports
 * should be done in .astro files
 */

/**
 * Helper function to merge content with localized versions
 */
export function localizeContent(baseContent, languageContent) {
    if (!languageContent) return baseContent;

    return {
        ...baseContent,
        content: {
            ...baseContent.content,
            ...languageContent
        }
    };
}

/**
 * Apply environment-specific overrides
 */
export function applyEnvironmentOverrides(content, environment = 'production') {
    if (!content.environments?.[environment]) {
        return content;
    }

    const envOverrides = content.environments[environment];

    return {
        ...content,
        ...(envOverrides.content && { content: { ...content.content, ...envOverrides.content } }),
        ...(envOverrides.styling && { styling: { ...content.styling, ...envOverrides.styling } }),
        ...(envOverrides.metadata && { metadata: { ...content.metadata, ...envOverrides.metadata } })
    };
}

/**
 * Check if content matches current environment
 */
export function isEnvironmentMatch(content, environment) {
    if (!content.metadata?.environment) return true;
    return content.metadata.environment.includes(environment);
}

/**
 * Get available languages - to be called from .astro files
 * This is a helper that expects the languages collection to be passed in
 */
export function getAvailableLanguages(languagesCollection) {
    try {
        return languagesCollection.map(lang => ({
            code: lang.data.code,
            name: lang.data.name,
            flag: lang.data.flag
        }));
    } catch (error) {
        console.warn('Languages collection not found, using default');
        return [{ code: 'en', name: 'English', flag: '🇺🇸' }];
    }
}

/**
 * Get localized content by language code - helper function
 */
export function getLocalizedContent(langData) {
    try {
        return langData?.data?.sections || {};
    } catch (error) {
        console.warn('Language data not found, using default');
        return {};
    }
}

/**
 * Build CSS classes from styling configuration
 */
export function buildSectionClasses(styling = {}) {
    const {
        backgroundOpacity = 'bg-opacity-10',
        contentBackgroundOpacity = 'bg-opacity-75',
        maxWidth = 'max-w-lg',
        textAlign = 'text-right',
        justifyContent = 'justify-end',
        layout = 'right',
        theme = 'dark'
    } = styling;

    return {
        background: `absolute inset-0 bg-black ${backgroundOpacity}`,
        container: `container mx-auto px-4 flex ${justifyContent} items-center h-full relative z-10`,
        content: `bg-black ${contentBackgroundOpacity} p-6 rounded-lg ${textAlign} ${maxWidth}`,
        section: `relative bg-custom-slate py-12 bg-center bg-cover`,
        theme: theme,
        layout: layout
    };
}

/**
 * Validate section content structure
 */
export function validateSectionContent(section) {
    const required = ['id', 'content'];
    const missing = required.filter(field => !section[field]);

    if (missing.length > 0) {
        console.warn(`Section missing required fields: ${missing.join(', ')}`);
        return false;
    }

    return true;
}

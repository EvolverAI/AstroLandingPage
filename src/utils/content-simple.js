// Simple test version of content utilities
console.log('Content utility loaded successfully');

export async function getSection(sectionId, language = 'en', environment = 'production') {
    console.log(`Getting section: ${sectionId} for language: ${language}`);

    // Simple fallback content for testing
    const fallbackContent = {
        about: {
            id: "about",
            backgroundImage: "/img/evolverai-web-company-bg.jpg",
            minHeight: "600px",
            content: {
                companyName: "Evolver",
                companyNameHighlight: "AI",
                description: "At EvolverAI, we specialize in developing smart, innovative solutions that empower companies to thrive in the modern digital landscape."
            },
            styling: {
                backgroundOpacity: "bg-opacity-10",
                contentBackgroundOpacity: "bg-opacity-75",
                maxWidth: "max-w-lg",
                textAlign: "text-right",
                justifyContent: "justify-end"
            }
        }
    };

    return fallbackContent[sectionId] || null;
}

export async function getLocalizedContent(language = 'en') {
    console.log(`Getting localized content for: ${language}`);
    return {};
}

export async function getAvailableLanguages() {
    return [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ];
}

export async function getPageSections(pageId = 'home', language = 'en', environment = 'production') {
    console.log(`Getting page sections for: ${pageId}`);
    return [];
}

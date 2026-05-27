const STORAGE_KEY = 'lastSurvivorsLanguage';
const DEFAULT_LANGUAGE = 'pt';
const SUPPORTED_LANGUAGES = ['pt', 'en'];

export function initLanguage(scene) {
    const savedLanguage = readSavedLanguage();
    scene.registry.set('language', savedLanguage);
}

export function getLanguage(scene) {
    return scene.registry.get('language') || DEFAULT_LANGUAGE;
}

export function setLanguage(scene, language) {
    const nextLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    scene.registry.set('language', nextLanguage);
    saveLanguage(nextLanguage);
}

export function t(scene, key, params = {}) {
    const language = getLanguage(scene);
    const translations = scene.cache.json.get(`lang-${language}`) || scene.cache.json.get(`lang-${DEFAULT_LANGUAGE}`) || {};
    const fallbackTranslations = scene.cache.json.get(`lang-${DEFAULT_LANGUAGE}`) || {};
    let text = findTranslation(translations, key) || findTranslation(fallbackTranslations, key) || key;

    Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replaceAll(`{${paramKey}}`, value);
    });

    return text;
}

function findTranslation(translations, key) {
    return key.split('.').reduce((current, part) => current?.[part], translations);
}

function readSavedLanguage() {
    try {
        const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
        return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
    } catch {
        return DEFAULT_LANGUAGE;
    }
}

function saveLanguage(language) {
    try {
        window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
        // If storage is blocked, the current session language still works through the registry.
    }
}

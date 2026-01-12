import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        return {};
    }
}

function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenObject(obj[key], pre));
        } else {
            acc[pre] = obj[key];
        }
        return acc;
    }, {});
}

function main() {
    console.log('🔍 Checking for missing translations...\n');

    const enPath = path.join(__dirname, '../src/locales/en.json');
    const esPath = path.join(__dirname, '../src/locales/es.json');

    const en = loadJsonFile(enPath);
    const es = loadJsonFile(esPath);

    const flatEn = flattenObject(en);
    const flatEs = flattenObject(es);

    // Find missing keys
    const missingInEs = [];
    const missingInEn = [];

    for (const key in flatEn) {
        if (!flatEs.hasOwnProperty(key)) {
            missingInEs.push(key);
        }
    }

    for (const key in flatEs) {
        if (!flatEn.hasOwnProperty(key)) {
            missingInEn.push(key);
        }
    }

    // Display results
    if (missingInEs.length > 0) {
        console.log('📝 Missing in Spanish:');
        missingInEs.forEach(key => {
            console.log(`  - ${key}: "${flatEn[key]}"`);
        });
    } else {
        console.log('✅ No missing keys in Spanish');
    }

    if (missingInEn.length > 0) {
        console.log('\n📝 Missing in English:');
        missingInEn.forEach(key => {
            console.log(`  - ${key}: "${flatEs[key]}"`);
        });
    } else {
        console.log('✅ No missing keys in English');
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log(`Total keys in English: ${Object.keys(flatEn).length}`);
    console.log(`Total keys in Spanish: ${Object.keys(flatEs).length}`);
    console.log(`Missing in Spanish: ${missingInEs.length}`);
    console.log(`Missing in English: ${missingInEn.length}`);

    if (missingInEs.length === 0 && missingInEn.length === 0) {
        console.log('\n🎉 All translations are complete!');
    } else {
        console.log('\n🚨 Run: npm run fix-translations to add missing keys automatically');
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
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

function saveJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function setValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {};
        }
        current = current[part];
    }

    current[parts[parts.length - 1]] = value;
}

function main() {
    console.log('🔧 Fixing missing translations...\n');

    const enPath = path.join(__dirname, '../src/locales/en.json');
    const esPath = path.join(__dirname, '../src/locales/es.json');

    const en = loadJsonFile(enPath);
    const es = loadJsonFile(esPath);

    // Add missing key to Spanish
    if (!es.groceryList?.removeFromList && en.groceryList?.removeFromList) {
        setValue(es, 'groceryList.removeFromList', 'Eliminar de la Lista de Compras');
        console.log('✅ Added missing key to Spanish: groceryList.removeFromList');
    }

    // Add missing keys to English from Spanish
    const missingKeys = [
        { path: 'recipes.calories', spanishValue: 'Calories' },
        { path: 'recipes.servings', spanishValue: 'Servings' },
        { path: 'recipes.chef', spanishValue: 'Chef' },
        { path: 'recipes.tags', spanishValue: 'Tags' },
        { path: 'recipes.video', spanishValue: 'Cooking Video' },
    ];

    missingKeys.forEach(({ path: keyPath, spanishValue }) => {
        const keyName = keyPath.split('.')[1];
        if (es.recipes && es.recipes[keyName] && !en.recipes[keyName]) {
            setValue(en, keyPath, spanishValue);
            console.log(`✅ Added missing key to English: ${keyPath}`);
        }
    });

    // Save files
    saveJsonFile(esPath, es);
    saveJsonFile(enPath, en);

    console.log('\n🎉 Missing translations have been added!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run check-translations to verify');
    console.log('2. Review the added translations');
    console.log('3. Update any components using hardcoded text');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
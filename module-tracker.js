// Module tracker
console.log('Module tracker loaded');

// Track module loading
const moduleLoadOrder = [];
const originalImport = window.import;

window.import = async function(moduleSpecifier) {
    console.log('TRACKER: Loading module:', moduleSpecifier);
    moduleLoadOrder.push(moduleSpecifier);
    
    try {
        const result = await originalImport(moduleSpecifier);
        console.log('TRACKER: Successfully loaded:', moduleSpecifier);
        return result;
    } catch (error) {
        console.error('TRACKER: Failed to load:', moduleSpecifier, error);
        console.log('TRACKER: Module load order so far:', moduleLoadOrder);
        throw error;
    }
};

// Export the tracker
export const tracker = {
    getLoadOrder: () => moduleLoadOrder
}; 
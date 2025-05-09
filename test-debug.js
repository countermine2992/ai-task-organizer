// Debug file to track module loading
console.log('Debug file loaded');

// Create a proxy for the import function
const importProxy = new Proxy(window.import, {
    apply: function(target, thisArg, args) {
        const [moduleSpecifier] = args;
        console.log('DEBUG: Attempting to import:', moduleSpecifier);
        return target.apply(thisArg, args)
            .then(result => {
                console.log('DEBUG: Successfully imported:', moduleSpecifier);
                return result;
            })
            .catch(error => {
                console.error('DEBUG: Failed to import:', moduleSpecifier, error);
                throw error;
            });
    }
});

// Replace the import function
window.import = importProxy;

// Export something to make this a module
export const debug = true; 
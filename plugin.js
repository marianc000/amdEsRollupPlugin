const path = require('path');
const workingDir = process.cwd();
 
function ImportmapPlugin({ imports} = {imports:[]}) {
    let cache;

    console.log("XXX esmImportToUrl", workingDir, imports);
    return {
        name: 'rollup-plugin-importmap',

        async buildStart(options) {
            console.log(">buildStart found imports:", imports);
            cache = new Map(Object.entries(imports));
            console.log("cache", cache);
        },

        resolveId(source, importer) {
            console.log("XXX resolveId", source, importer);
            const url = cache.get(source);
            if (url) {
                return url;
            } else {
                const entry = Array.from(cache).find(([key, val]) => source.startsWith(key)
                    && source.length > key.length);
                if (entry) {
                    const [key, val] = entry;
                    const r = source.replace(key, val);
                    console.log("found", key, val, source, '=>', r);
                    return r;
                }
            }
            return null;
        },

        resolveImportMeta(property, obj) {
         
            // console.log("XXX resolveImportMeta",property, obj,pathN.relative(workingDir, obj.moduleId));
            return null;
        },

        transform(code, id) {
            // console.log("XXX transform",id, code.length);
            return code;
        }

    };
}

module.exports = ImportmapPlugin;

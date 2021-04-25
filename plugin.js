const path = require('path');
const { normalizePath } = require('@rollup/pluginutils');
const { readFileSync } = require('fs');

const workingDir = process.cwd();

function toAbsolutePath(relativePath){
    return  path.resolve(workingDir, relativePath);
}
//await loadHTML('./ONGOING.html',import.meta.url);

function ImportmapPlugin({ imports } = { imports: [] }) {
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
            // console.log("XXX resolveId", source, importer);
            const url = cache.get(source);
            if (url) {
                return toAbsolutePath(url);
            } else {
                const entry = Array.from(cache).find(([key, val]) => source.startsWith(key)
                    && source.length > key.length);
                if (entry) {
                    const [key, val] = entry;
                    const r = toAbsolutePath(source.replace(key, val));
                  //  console.log("found", key, val, source, '=>', r);
                    return r;
                }
            }
            return null;
        },

        // load (id){
        //     if (id.includes('dataHolder'))
        //      console.log("---------------------",id);
        //    // else console.log("---",id);
        //     return null;
        // },

        resolveImportMeta(property, obj) {

            // console.log("XXX resolveImportMeta",property, obj,normalizePath(athN.relative(workingDir, obj.moduleId)));
            return null;
        },

        transform(code, id) {
            const re = /await +loadHTML\('([^,]+)',/g;
            function replacer(match, p1, offset, string) {
                console.log(p1);
                const filePath = path.resolve(path.dirname(id), p1);
                console.log("transform found ", p1, id, filePath);
                const html = readFileSync(filePath,{encoding  : 'utf8'});

                return JSON.stringify(html) + "; //";

            }
            const newCode = code.replace(re, replacer);
            if (code.length != newCode.length)
                console.log("transform ", code.length, '=>', newCode.length);
            return newCode;
        }

    };
}

module.exports = ImportmapPlugin;

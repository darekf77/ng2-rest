if [ -d "aot" ]; then
    rm -rf "aot"
fi
if [ -f "index.js" ]; then
    rm "index.js"
fi
if [ -f "index.js.map" ]; then
    rm "index.js.map"
fi
if [ -f "index.d.ts" ]; then
    rm "index.d.ts"
fi
find src/ -type f -name '*.js' -delete
find src/ -type f -name '*.js.map' -delete
find src/ -type f -name '*.d.ts' -delete



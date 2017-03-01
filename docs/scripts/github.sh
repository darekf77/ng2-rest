if [ -d "docs" ]; then
    rm -rf "docs" 
    mkdir "docs"
fi
export GITHUB_DEPLOY="darekf77/docs/dist"
export LIVE_BACKEND=true
export ENV="production"
npm run build:prod
cp -R dist ../demo

echo "done !"
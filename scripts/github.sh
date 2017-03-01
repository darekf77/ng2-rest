if [ -d "docs" ]; then
    rm -rf "docs" 
    mkdir "docs"
fi
export GITHUB_DEPLOY="darekf77/docs"
export LIVE_BACKEND=true
export ENV="production"
cd preview
npm run build:prod
cp -R dist ../docs
cd ..
echo "done !"
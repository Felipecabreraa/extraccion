#!/bin/bash
echo "🚀 Fixing CORS for GitHub Pages..."

# Agregar cambios
git add backend/src/app.js

# Commit
git commit -m "Fix CORS for GitHub Pages - Allow multiple origins"

# Push
git push origin develop

echo "✅ CORS fix deployed! Railway will auto-redeploy." 
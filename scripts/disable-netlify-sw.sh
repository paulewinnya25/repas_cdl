# Script de nettoyage pour Netlify
# Ce fichier empêche Netlify d'injecter des Service Workers problématiques

# Désactiver les Service Workers dans la configuration Netlify
echo "Disabling Service Workers in Netlify configuration..."

# Créer un fichier _headers pour bloquer les SW
cat > public/_headers << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

# Bloquer les Service Workers
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/cnm-sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
EOF

# Créer un fichier _redirects pour rediriger les SW
cat > public/_redirects << 'EOF'
# Rediriger les Service Workers vers une page vide
/sw.js /404.html 404
/cnm-sw.js /404.html 404
/service-worker.js /404.html 404
EOF

echo "Netlify configuration updated to block Service Workers"

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'robots.txt', 'pwa-192.png', 'pwa-512.png'],
  manifest: {
    name: 'InventoryPro',
    short_name: 'InventoryPro',
    description: 'Smart POS & CRM for Retail Businesses',
    theme_color: '#4f46e5',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: '/pwa-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/pwa-512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/pwa-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
})

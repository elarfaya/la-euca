import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  base: '/la-euca/',

  plugins: [

    react(),

    VitePWA({

      registerType: 'autoUpdate',

      manifest: {

        name: 'La Euca',

        short_name: 'La Euca',

        description:
          'Gestión del pipero',

        theme_color: '#09090b',

        background_color: '#09090b',

        display: 'standalone',

        start_url: '/la-euca/',

        icons: [
          {
            src: '/la-euca/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    }),

    tailwindcss()
  ]
})
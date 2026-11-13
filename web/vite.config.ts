import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'

export default {
  plugins: [tailwindcss(), sveltekit()],
  server: {
    // dev server is reached through Tailscale, not localhost
    allowedHosts: ['localhost', '.taild7e20.ts.net'],
  },
}

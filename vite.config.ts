import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    if (mode === 'lib') {
        // Library build mode
        return {
            plugins: [react()],
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, "./src"),
                },
            },
            build: {
                lib: {
                    entry: path.resolve(__dirname, 'src/index.ts'),
                    name: 'AgentChat',
                    formats: ['es', 'cjs'],
                    fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
                },
                rollupOptions: {
                    external: ['react', 'react-dom', 'react/jsx-runtime'],
                    output: {
                        globals: {
                            react: 'React',
                            'react-dom': 'ReactDOM',
                            'react/jsx-runtime': 'react/jsx-runtime'
                        },
                        assetFileNames: (assetInfo) => {
                            if (assetInfo.name === 'style.css') return 'index.css'
                            return assetInfo.name ?? 'assets/[name]-[hash][extname]'
                        }
                    }
                },
                cssCodeSplit: false,
            }
        }
    }

    // Development mode
    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    }
})

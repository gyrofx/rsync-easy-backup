import { readdirSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    // setupFiles: ['src/__test__/setupTests.ts'],
    // coverage: {
    //   reporter: process.env.CI ? ['text', 'text-summary', 'html', 'lcov', 'cobertura'] : undefined,
    // },
    // reporters: process.env.CI ? ['default', 'html', 'junit', 'vitest-sonar-reporter'] : undefined,
    // outputFile: {
    //   junit: 'test-report/junit.xml',
    //   'vitest-sonar-reporter': 'test-report/test-report.xml',
    //   html: 'test-report/test-report.html',
    // },
    // exclude: [...configDefaults.exclude, ...excludedTestPatterns()],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

function alias() {
  const directories = readdirSync(path.resolve(__dirname, './src'), { withFileTypes: true })
  return Object.fromEntries(directories.map((dir) => [dir.name, path.resolve(__dirname, `./src/${dir.name}`)]))
}

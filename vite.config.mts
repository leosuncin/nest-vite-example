import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ...VitePluginNode({
      adapter: 'nest',
      appPath: 'src/main.ts',
      exportName: 'app',
      tsCompiler: 'swc',
    }),
  ],
  test: {
    globals: true,
    mockReset: true,
    environment: 'node',
    clearMocks: true,
  },
});

import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  plugins: [
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

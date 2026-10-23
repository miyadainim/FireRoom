import {defineConfig} from 'vitest/config';
// Original full suite. Requires consent-restricted local fixtures; never fabricate replacements.
export default defineConfig({test:{include:['tests/**/*.test.ts'],maxWorkers:2}});

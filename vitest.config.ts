import {defineConfig} from 'vitest/config';
import {readFileSync} from 'node:fs';
// Keep SDK Jest and consent-restricted participant replay tests separate.
const privateTests=JSON.parse(readFileSync(new URL('./scripts/private-fixture-tests.json',import.meta.url),'utf8')) as string[];
export default defineConfig({test:{include:['tests/**/*.test.ts'],exclude:privateTests,maxWorkers:2}});

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig(
  { ignores: ['**/dist/', '**/.next/', '**/coverage/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier, // por último: desliga as regras de formatação que brigariam com o Prettier
);

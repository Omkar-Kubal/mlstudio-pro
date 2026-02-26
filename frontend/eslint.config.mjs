import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    basePath: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        ignores: [
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
        ],
    },
    {
        // Project-wide rule overrides
        rules: {
            // JSX text with special chars — prevalent in educational/math content
            "react/no-unescaped-entities": "off",
            // Comments in JSX text nodes — common in inline annotations
            "react/jsx-no-comment-textnodes": "off",
            // Hook dependency arrays — too many animation frameloops with intentional deps
            "react-hooks/exhaustive-deps": "warn",
            // any type — acceptable in animation math helpers and API boundaries
            "@typescript-eslint/no-explicit-any": "warn",
            // Unused expressions — sometimes used for short-circuit patterns
            "@typescript-eslint/no-unused-expressions": "warn",
            // Next.js img — acceptable in non-critical UI areas
            "@next/next/no-img-element": "warn",
            // Allow _ prefix for intentionally unused vars (standard TS convention)
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "vars": "all",
                    "args": "after-used",
                    "varsIgnorePattern": "^_",
                    "argsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_",
                    "destructuredArrayIgnorePattern": "^_",
                    "ignoreRestSiblings": true
                }
            ],
        },
    },
];

export default eslintConfig;

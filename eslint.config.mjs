import js from '@eslint/js';
import i18nextPlugin from 'eslint-plugin-i18next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    // GLOBAL IGNORES
    {
        ignores: [
            'node_modules/**',
            'android/**',
            'ios/**',
            '.expo/**',
            'web-build/**',
            'dist/**',
            'babel.config.js',
            'metro.config.js',
            'package.json',
            'package-lock.json',
            'eslint.config.mjs',
        ],
    },

    // BASE CONFIGS
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // GENERAL RULES (Run for all JS/TS, no type checking required)
    {
        files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                ...globals.jest,
            },
        },
        plugins: {
            react: reactPlugin,
            'react-native': reactNativePlugin,
            'react-hooks': reactHooksPlugin,
            i18next: i18nextPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react-native/no-inline-styles': 'warn',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': ['warn', { allow: ['warn', 'error'] }],

            // React Native standard patterns
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',

            // i18n scanner - Find literal strings
            // 'i18next/no-literal-string': ['warn', {
            //     'markupOnly': true,
            //     'ignoreComponent': [
            //         'Icon', 'IconSymbol', 'StatusBar', 'ActivityIndicator',
            //         'RefreshControl', 'FlashList', 'FlatList', 'ScrollView',
            //         'Animated.View', 'View', 'Pressable', 'TouchableOpacity'
            //     ],
            //     'ignoreAttribute': [
            //         'style', 'contentContainerStyle', 'testID', 'nativeID',
            //         'color', 'backgroundColor', 'tintColor'
            //     ],
            //     'onlyAttributes': ['placeholder', 'title', 'label'],
            //     'ignore': [
            //         '^[A-Z0-9_-]+$',
            //         '^[0-9]+$',
            //         '^[\\+\\-\\*/%&\\|<>!\\?:]+$'
            //     ],
            // }],
        },
    },

    // TYPE-AWARE RULES (Only run for TS, require project config)
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // '@typescript-eslint/no-deprecated': 'warn',
        },
    },

    // SPECIAL CONFIG FOR EXPO PLUGINS (Node.js context)
    {
        files: ['plugins/**/*.{js,ts}'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            'no-console': 'off',
        },
    }
];

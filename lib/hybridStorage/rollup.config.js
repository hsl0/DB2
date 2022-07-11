import typescript from 'rollup-plugin-typescript2';
import notMicrosoft from 'rollup-plugin-not-microsoft';

const config = {
    plugins: [
        typescript(),
        notMicrosoft()
    ]
};

export default [
    {
        input: './src/anon.ts',
        output: {
            file: './dist/anon.js',
            format: 'cjs',
            sourcemap: true
        },
        ...config
    },
    {
        input: './src/user.ts',
        output: {
            file: './dist/user.js',
            format: 'cjs',
            sourcemap: true
        },
        ...config
    }
];
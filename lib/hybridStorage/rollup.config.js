import typescript from 'rollup-plugin-typescript2';
import notMicrosoft from 'rollup-plugin-not-microsoft';

const output = {
    format: 'cjs',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src'   
};
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
            ...output
        },
        ...config
    },
    {
        input: './src/user.ts',
        output: {
            file: './dist/user.js',
            ...output
        },
        ...config
    }
];

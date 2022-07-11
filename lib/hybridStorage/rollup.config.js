import typescript from 'rollup-plugin-typescript2';
import cleanup from 'rollup-plugin-cleanup';

const config = {
    plugins: [
        typescript(),
        cleanup({
            comments: 'none',
            extensions: ["js", "ts"],
            include: '../../node_modules/tslib/**/*',
            exclude: 'src/*'
        })
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
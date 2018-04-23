//npm install rollup rollup-plugin-babel babel-core babel-preset-env --save-dev
//npm install rollup-plugin-commonjs rollup-plugin-node-resolve --save-dev
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
export default [{
    input: 'src/module/main.js',
    output: {
        file: 'dist/main.js',
        format: 'iife'
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            // non-CommonJS modules will be ignored, but you can also
            // specifically include/exclude files
            include: 'node_modules/**',  // Default: undefined
            exclude: ['node_modules/foo/**', 'node_modules/bar/**'],  // Default: undefined
            // these values can also be regular expressions
            // include: /node_modules/

            // search for files other than .js files (must already
            // be transpiled by a previous plugin!)
            extensions: ['.js', '.coffee'],  // Default: [ '.js' ]

            // if true then uses of `global` won't be dealt with by this plugin
            ignoreGlobal: false,  // Default: false

            // if false then skip sourceMap generation for CommonJS modules
            sourceMap: false,  // Default: true

            // explicitly specify unresolvable named exports
            // (see below for more details)
            namedExports: { './module.js': ['foo', 'bar'] },  // Default: undefined

            // sometimes you have to leave require statements
            // unconverted. Pass an array containing the IDs
            // or a `id => boolean` function. Only use this
            // option if you know what you're doing!
            ignore: ['conditional-runtime-dependency']
        }),
        babel({
            exclude: 'node_modules/**',
            "presets": [[
                "env",
                {
                    "modules": false
                }
            ]],
            "plugins": [
                ["transform-react-jsx", {
                    "pragma": "l"
                }],
                "external-helpers"
            ]
        }),
        // commonjs()
    ]
}]

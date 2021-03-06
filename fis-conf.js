//glob http://fis.baidu.com/fis3/docs/api/config-glob.html
var pkg = require('./package');
fis.set('project.md5Length', 6);
fis.set('project.md5Connector ', '-');
var domain = 'http://cdn.vveshow.com/cloud/' + pkg.name;
// * 匹配所有文件
// *.js 匹配所有js

// 启用commonjs,mod.js
fis.hook('commonjs', {});

//使用npm install做包管理器;若使用fis3 install做包管理器,注释下面两段,并且把node_modules改成components
// 禁用components
fis.unhook('components');

// 启用node_modules
fis.hook('node_modules');

//fis.match('*', {
//    release: '/backyard/$0' // 所有资源发布时产出到 /static 目录下
//});

////开启组件同名依赖
//fis.match('*.{html,js,php}', {
//    useSameNameRequire: true
//});

// 生态模块配置
// package.main || index.js
// var antd = require('antd') => node_modules/antd/{package.main}.js | node_modules/antd/index.js
fis.match(/^\/node_modules\/(.+)\.(?:js)$/i, {
    //id: '$1',
    isMod: true,
    useSameNameRequire: true
    //,packTo: '/pkg/lib.js'
});

fis.match('/node_modules/(**.{js,css})', {
    release: '/lib/$1'
});

// 工程模块配置
// subpath.js || subpath/index.js || subpath/subpath.js
// require('../home') => ../home.js | ../home/index.js | ../home/home.js
// require('/modules/abc'); 全路径
fis.match(/^\/(?:|common|app|modules)\/(.+)\.(?:js|jsx|es6)$/i, {
    //id: '$1',
    rExt: 'js',
    isMod: true,
    //useSameNameRequire: true,
    // 解析es6, jsx  babel-5.x babelx-5.x babel-core
    parser: fis.plugin('babel-5.x', {
        stage: 0,
        blacklist: ['regenerator'],
        optional: ["es7.decorators", "es7.classProperties"],
        //sourceMaps: true
    }),

    // babel 6
    //parser: fis.plugin('babeljs', {
    //    "presets": ["es2015", "react", "stage-0"]
    //}),

    //parser: fis.plugin('typescript', {
    //module: 1,
    //target: 2,
    //sourceMap: true
    //
    //}),

    // 添加css和image加载支持
    preprocessor: [
        fis.plugin('js-require-css', {}),
        fis.plugin('js-require-file', {
            useEmbedWhenSizeLessThan: 10 * 1024 // 小于10k用base64
        })
    ]
    //,packTo: '/pkg/app.js'
});

//fis-parser-babel-6.x
// 用 node-sass 解析
// fis.match('*.scss', {
//     rExt: 'css',
//     parser: [
//         fis.plugin('node-sass', {
//             include_paths: [
//                 'assets/scss'
//             ] || []
//         })
//     ],
//     postprocessor: fis.plugin('autoprefixer')
// });

// less
fis.match('*.less', {
    rExt: '.css', // from .less to .css
    parser: [
        fis.plugin('less-2.x', {
            // fis-parser-less-2.x option
        }),
        fis.plugin('rem', {
            rem: 32,
            min: 12,
            exclude: ['font-size']
        })
    ],
    postprocessor: [
        fis.plugin('autoprefixer'),
    ]
});

// server文件不编译
fis.match(/^\/server\/(.*)$/i, {
    useCompile: false,
    release: '/server/$1'
})

// 依赖打包
fis.match('::package', {
    packager: fis.plugin('deps-pack', {
        'pkg/app.js': [
            '/app/index.js',
            '/app/index.js:deps',
            '!/common/**',
            '!/node_modules/**'
        ],
        'pkg/app.css': [
            '/app/index.js',
            '/app/index.js:deps',
            '!/common/**',
            '!/node_modules/**'
        ],
        'pkg/common.js': [
            '/app/index.js:deps',
            '/common/**',
            '!/node_modules/**'
        ],
        'pkg/common.css': [
            '/app/index.js:deps',
            '/common/**',
            '!/node_modules/**'
        ],
        'pkg/lib.js': [
            '/app/index.js:deps',
            '/node_modules/**',
            '!/common/**',
        ],
        'pkg/lib.css': [
            '/app/index.js:deps',
            '/node_modules/**',
            '!/common/**',
        ]
    }),
    postpackager: fis.plugin('loader', {
        //allInOne: true, //是否合并非模块化零碎资源
        //useInlineMap: true // 资源映射表内嵌
    })
});


fis.match('::image', {
    useHash: true
});


fis.match('/favicon.ico', {
    useHash: false
});

// ci环境
fis.media('testing')
    .match(/\.js$/i, {
        // 指定压缩插件 fis-optimizer-uglify-js
        optimizer: fis.plugin('uglify-js', {
            // option of uglify-js
        }),
        useHash: true
    })
    .match(/\.(css|scss)$/i, {
        optimizer: fis.plugin('clean-css'),
        useHash: true
    });

fis.media('production')
    .match('*', {
        domain: domain
    })
    .match(/\.js$/i, {
        // 指定压缩插件 fis-optimizer-uglify-js
        optimizer: fis.plugin('uglify-js', {
            // option of uglify-js
        }),
        useHash: true
    })
    .match(/\.(css|scss)$/i, {
        optimizer: fis.plugin('clean-css'),
        useHash: true
    })
    .match('/app/component/distribution/img/**', {
        domain: null
    })
    .match('/app/component/vcard/img/**', {
        domain: null
    });


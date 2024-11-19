const mix = require('laravel-mix');
const { max } = require('lodash');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', './dist/js').vue().sass('resources/scss/app.scss','./dist/css/app.css').options({processCssUrls: false}).sourceMaps(true, 'source-map').browserSync({watch: true, files: ['./dist/css/*.css','./dist/*.html'], host: 'slapp.test', proxy: {target: 'https://slapp.test'}});
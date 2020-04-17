const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const browserify = require('gulp-browserify');
const del = require('del');
const browserSync = require('browser-sync').create();
const smartgrid = require('smart-grid');

const jsFiles = [
    'src/js/index.js',
]

function styles() {
    return gulp.src('src/styles/main.scss')
                .pipe(sass({
                    includePaths: require('node-normalize-scss').includePaths
                }))
                .pipe(concat('styles.css'))
                .pipe(gcmq())
                .pipe(autoprefixer({
                    overrideBrowserslist: ['> 0.1%'],
                    cascade: false
                }))
                .pipe(cleanCSS({
                    level: 2
                }))
                .pipe(gulp.dest('build/css'))
                .pipe(browserSync.stream());
}

function script() {
    return gulp.src(jsFiles)
                .pipe(concat('script.js'))
                .pipe(babel({
                    presets: ['@babel/env']
                }))
                .pipe(uglify({
                    toplevel: true
                }))
                .pipe(browserify({
                    insertGlobals : true,
                }))
                .pipe(gulp.dest('build/js'))
                .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('src/styles/**/*.scss', styles);
    gulp.watch('src/js/**/*.js', script);
    gulp.watch('*.html').on('change', browserSync.reload);
}

function clean() {
    return del(['build/*']);
}

function grid(done) {
    smartgrid('./src/scss', {
        outputStyle: 'scss', /* less || scss || sass || styl */
        columns: 12, /* number of grid columns */
        offset: '30px', /* gutter width px || % || rem */
        mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
        container: {
            maxWidth: '1170px', /* max-width оn very large screen */
            fields: '80px' /* side fields */
        },
        breakPoints: {
            lg: {
                width: '962px',
                fields: '40px'
            },
            md: {
                width: '750px',
                fields: '40px'
            }
            /* 
            We can create any quantity of break points.
    
            some_name: {
                width: 'Npx',
                fields: 'N(px|%|rem)',
                offset: 'N(px|%|rem)'
            }
            */
        }
    });
    done();
}

gulp.task('styles', styles);
gulp.task('script', script);
gulp.task('watch', watch);
gulp.task('grid', grid);

gulp.task('build', gulp.series(clean,
                        gulp.parallel(styles, script)
                    ));

gulp.task('dev', gulp.series('build', 'watch'));

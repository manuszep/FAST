var gulp = require('gulp');
var clean = require('gulp-clean');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var frontMatter = require('gulp-front-matter');
var gulp_swig = require('gulp-swig');
var through = require('through2');
var casperJs = require('gulp-casperjs');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

var relative_path = function() {
    var root = __dirname + '/app/pages/';
    return through.obj(function (file, enc, cb) {
        var parts_count = file.path.replace(root, '').replace(/^\/|\/$/g, '').split( '/' ).length;
        var relative_parts = new Array( parts_count ).join( "../" );
        if (typeof file.data == 'undefined') {
            file.data = {};
        }

        file.data.root_prefix = relative_parts;
        this.push(file);
        cb();
    });
};

var swig_opts = {
    defaults: {
        cache: false
    },
    setup: function(swig) {
        swig.setTag(
            'storeAt',
            function(str, line, parser, types, stack, options, swig) {
                parser.on(types.STRING, function (token) {
                    this.out.push(token.match);
                    return;
                });

                return true;
            },
            function(compiler, args, content, parents, options, blockName) {
                var comp = content[0].replace(/\\/g, '\\\\').replace(/\n|\r/g, '\\n').replace(/"/g, '\\"');
                return 'if (typeof _ctx.storeAt == "undefined") {\n' +
                    '   _ctx.storeAt = {};\n' +
                    '}\n' +
                    'if (typeof _ctx.storeAt[' + args[0] + '] == "undefined") {\n' +
                    '   _ctx.storeAt[' + args[0] + '] = [];\n' +
                    '}\n' +
                    '_ctx.storeAt[' + args[0] + '].push("' + comp + '");\n';
            },
            true,
            true
        );
    }
};

gulp.task('styles', function() {
    var sources = 'app/scss/**/*.scss';

    return gulp.src(sources)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', function (err) {
            console.log(err);
            this.emit('end');
        })
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('tmp/css'))
        .pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
    var sources = 'app/js/**/*.js';

    return gulp.src(sources)
        .pipe(plumber())
        .pipe(gulp.dest('tmp/js'))
        .pipe(reload({stream: true}));
});

var html = function(path, dest) {
    var sources = path;

    return gulp.src(sources)
        .pipe(plumber())
        .pipe(frontMatter({ property: 'data' }))
        .pipe(relative_path())
        .pipe(gulp_swig(swig_opts))
        .pipe(gulp.dest(dest))
        .pipe(reload({stream: true}));
};

gulp.task('html', function() {
    html('app/pages/**/*.html', 'tmp');
});

gulp.task('htmlTests', function() {
    html('app/tests/**/*.html', 'tmp/tests');
});

gulp.task('clean', function() {
    return gulp.src('tmp', {read: false})
        .pipe(clean());
});

gulp.task('prepareServer', ['clean'], function() {
    gulp.start('styles');
    gulp.start('scripts');
    gulp.start('html');
    gulp.start('htmlTests');
});

var server_options = {
    notify: false,
    port: 8000,
    server: {
        baseDir: ['tmp']
    },
    open: true
};

gulp.task('webserver', ['prepareServer'], function() {
    browserSync(server_options);
});

var test = function() {
    var sources = 'app/tests/**/*.js';

    return gulp.src(sources)
        .pipe(casperJs());
};

gulp.task('test', ['prepareServer'], function() {
    test();
});

gulp.task('serve', ['webserver'], function() {
    test();

    gulp.watch('app/scss/**/*.scss', ['styles']);
    gulp.watch('app/js/**/*.js', ['scripts']);
    gulp.watch(['app/**/*.html', 'app/**/*.tpl', '!app/tests/**/*.html'], ['html']);
    gulp.watch('app/tests/**/*', test);
});

gulp.task('default', ['serve']);

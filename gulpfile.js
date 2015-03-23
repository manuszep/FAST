var gulp = require('gulp');
var clean = require('gulp-clean');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var frontMatter = require('gulp-front-matter');
var gulp_swig = require('gulp-swig');
var through = require('through2');
var casperJs = require('gulp-casperjs');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var iconfont = require('gulp-iconfont');
var gutil = require('gulp-util');
var jsonSass = require('./node_modules/json-sass/lib/jsToSassString');
var path = require('path');
var glob = require( 'glob' );

var json_data = {};

glob.sync( 'app/data/**/*.json' ).forEach( function( file ) {
    var ns = path.dirname(file).replace('app/data/', '').replace('/', '-');
    var v = path.basename(file, '.json');

    json_data[ns] = json_data[ns] || {};

    json_data[ns][v] = require(path.resolve(file));
});

function gulpJsonSass(config) {
    var stream = through.obj(function(file, enc, cb) {
        var parsedJSON = JSON.parse(file.contents);
        var name = path.basename(file.path, '.json');
        var dirname = path.dirname(file.path);
        var sass = '$FAST-data-' + name + ': ' + jsonSass(parsedJSON) + ";";
        file.contents = Buffer(sass);
        file.path = dirname + "/_" + name + ".scss";
        // make sure the file goes through the next gulp plugin
        this.push(file);
        cb();
    });

    // returning the file stream
    return stream;
}

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

var json_to_data = function() {
    return through.obj(function (file, enc, cb) {
        var parts_count = file.path.replace(root, '').replace(/^\/|\/$/g, '').split( '/' ).length;
        var relative_parts = new Array( parts_count ).join( "../" );

        file.data = file.data || {};

        file.data.data = json_data;
        this.push(file);
        cb();
    });
};

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

var stringToFile = function (filename, string) {
    var src = require('stream').Readable({ objectMode: true });

    src._read = function () {
        this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }));
        this.push(null);
    };
    return src;
};

var swig_opts = {
    defaults: {
        cache: false
    },
    setup: function(swig) {
        require('swig-highlight').apply(swig);

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

gulp.task('icons', function() {
    var sources = 'app/icons/**/*.svg';

    gulp.src(sources)
        .pipe(iconfont({
            fontName: 'fast-icons',
            appendCodepoints: false,
            descent: 70
        }))
        .on('codepoints', function(codepoints, options) {
            // Convert all codepoints to hexadecimal
            for (var i = 0; i < codepoints.length; i++) {
                codepoints[i].codepoint = codepoints[i].codepoint.toString(16);
            }

            var data = JSON.stringify({codepoints: codepoints, options: options});

            return stringToFile('icons.json', data)
                .pipe(gulp.dest('app/data/generated'))
        })
        .pipe(gulp.dest('tmp/fonts'));
});

gulp.task('styles', function() {
    var sources = 'app/scss/**/*.scss';

    gulp.src(['app/data/generated/**/*.json', 'app/data/common/**/*.json'])
        .pipe(gulpJsonSass({
            prefix: '$FAST-data: '
        }))
        .pipe(gulp.dest('app/scss/generated'));

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
        .pipe(json_to_data())
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
    gulp.start('icons');
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

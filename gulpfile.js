var gulp = require('gulp');
var jsonSass = require('./node_modules/json-sass/lib/jsToSassString');
var gutil = require('gulp-util');
var del = require('del');
var iconfont = require('gulp-iconfont');
var through = require('through2');
var path = require('path');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var frontMatter = require('gulp-front-matter');
var gulp_swig = require('gulp-swig');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var casperJs = require('gulp-casperjs');
var glob = require( 'glob' );

var json_data = {};

var current_context = "./tmp";

glob.sync( 'app/data/**/*.json' ).forEach( function( file ) {
    var ns = path.dirname(file).replace('app/data/', '').replace('/', '-');
    var v = path.basename(file, '.json');

    json_data[ns] = json_data[ns] || {};

    json_data[ns][v] = require(path.resolve(file));
});

/* Helpers.
 ===================================================== */

var switchEnv = function(env) {
    switch (env) {
        case 'server':
            current_context = "./tmp";
            break;
        case 'test':
            current_context = './tests';
            break;
        case 'build':
            current_context = './dist';
            break;
    }
}

var gulpJsonSass = function (config) {

    return through.obj(function(file, enc, cb) {
        var parsedJSON = jsonSass(JSON.parse(file.contents));
        var name = path.basename(file.path, '.json');
        var dirname = path.dirname(file.path);
        var sass = '$FAST-data-' + name + ': ' + parsedJSON + ";";

        file.contents = Buffer(sass);
        file.path = dirname + "/_" + name + ".scss";

        // make sure the file goes through the next gulp plugin
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

var relative_path = function() {
    var root = (current_context == './tests') ? __dirname + '/app/tests' : __dirname + '/app/pages/';
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


/* Tasks.
 ===================================================== */

gulp.task('clean:server', function(cb) {
    switchEnv('server');
    del([current_context], cb);
});

gulp.task('clean:test', function(cb) {
    switchEnv('test');
    del([current_context], cb);
});

gulp.task('clean:build', function(cb) {
    switchEnv('build');
    del([current_context], cb);
});

gulp.task('icons', function() {
    var sources = './app/icons/**/*.svg';
    var dest_data = './app/data/generated';
    var dest_font = current_context + '/fonts';

    return gulp.src(sources)
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

            // Convert variables to JSON strings
            var data = JSON.stringify({codepoints: codepoints, options: options});

            return stringToFile('icons.json', data)
                .pipe(gulp.dest(dest_data))
        })
        .pipe(gulp.dest(dest_font));
});

gulp.task('data', function(cb) {
    var sources = ['./app/data/generated/**/*.json', 'app/data/common/**/*.json'];
    var dest = './app/scss/generated';

    return gulp.src(sources)
        .pipe(gulpJsonSass({
            prefix: '$FAST-data: '
        }))
        .pipe(gulp.dest(dest));
});

gulp.task('styles', function() {
    var sources = './app/scss/**/*.scss';
    var dest = current_context + '/css';

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
        .pipe(gulp.dest(dest))
        .pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
    var sources = './app/js/**/*.js';
    var dest = current_context + '/js';

    return gulp.src(sources)
        .pipe(plumber())
        .pipe(gulp.dest(dest))
        .pipe(reload({stream: true}));
});

gulp.task('assets', function() {
    var sources = './app/static/**/*';
    var dest = current_context + '/assets';

    return gulp.src(sources)
        .pipe(plumber())
        .pipe(gulp.dest(dest))
        .pipe(reload({stream: true}));
});

gulp.task('pages', function() {
    var sources = (current_context == './tests') ? './app/tests/**/*.html' : './app/pages/**/*.html';
    var dest = current_context;

    return gulp.src(sources)
        .pipe(plumber())
        .pipe(frontMatter({ property: 'data' }))
        .pipe(relative_path())
        .pipe(json_to_data())
        .pipe(gulp_swig(swig_opts))
        .pipe(gulp.dest(dest))
        .pipe(reload({stream: true}));
});

gulp.task('watch', ['icons', 'data', 'styles', 'scripts', 'pages'], function() {
    gulp.watch('./app/icons/**/*.svg', ['icons']);
    gulp.watch(['./app/data/generated/**/*.json', 'app/data/common/**/*.json'], ['data', 'pages'])
    gulp.watch('./app/scss/**/*.scss', ['styles']);
    gulp.watch('./app/js/**/*.js', ['scripts']);
    gulp.watch(['./app/**/*.html', './app/**/*.tpl', '!./app/tests/**/*.html'], ['pages']);
});

gulp.task('buildTests', ['clean:test'], function() {
    gulp.start('icons');
    gulp.start('data');
    gulp.start('styles');
    gulp.start('scripts');
    gulp.start('assets');
    gulp.start('pages');

    var sources = './app/tests/**/*.js';
    var dest = './tests/casper';

    gulp.src(sources)
        .pipe(gulp.dest(dest));
});

gulp.task('test:hint', function() {
    var sources = ['./app/js/**/*.js', '!./app/js/libs/**/*.js'];

    return gulp.src(sources)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('test:casper', ['icons', 'data', 'styles', 'scripts', 'assets', 'pages'], function() {
    var sources = './tests/casper/**/*.js';

    return gulp.src(sources)
        .pipe(casperJs());
});

gulp.task('test', ['buildTests'], function() {
    gulp.start('test:hint');
    gulp.start('test:casper');
});

gulp.task('server:prepare', ['clean:server'], function() {
    gulp.start('icons');
    gulp.start('data');
    gulp.start('styles');
    gulp.start('scripts');
    gulp.start('assets');
    gulp.start('pages');
    gulp.start('watch');
});

gulp.task('server', ['server:prepare'], function() {
    var server_options = {
        notify: false,
        port: 8000,
        server: {
            baseDir: ['./tmp']
        },
        open: true
    };

    browserSync(server_options);
});

gulp.task('mergeScripts', function() {

});

gulp.task('compress', function() {

});

gulp.task('build', ['test'], function() {
    gulp.start('mergeScripts');
    gulp.start('compress');
});

gulp.task('cleanTestCaptures', function(cb) {
    del('./app/test/captures', cb);
});

gulp.task('acceptTestCaptures', ['cleanTestCaptures'], function() {
    var sources = './tests/captures/**/*.*';
    var dest = './app/tests/captures';

    gulp.src(sources)
        .pipe(gulp.dest(dest));
});

gulp.task('default', ['server']);
var gulp        = require('gulp'),          // Подключаем Gulp
    sass        = require('gulp-sass'),     //Подключаем Sass пакет,
    browserSync = require('browser-sync'),  // Подключаем Browser Sync
    concat      = require('gulp-concat'),  // Подключаем gulp-concat (для конкатенации файлов)
    uglify      = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cssnano     = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename      = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del         = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin    = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant    = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache       = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
    htmlmin      = require('gulp-htmlmin'),//Подключаем пакет для минификации HTML
    jade        = require('gulp-jade'),//Подключаем пакет jade
    dirSync = require('gulp-directory-sync'),//Подключаем плагин для синхронизации каталогов
    plumber = require('gulp-plumber'), //Подключаем плагин для формирования и вывода ошибок Gulp
    Promise     = require('es6-promise').Promise; // Подключаем библиотеку PostCSS нужна для работы с Node.js 0.10

gulp.task('browser-sync', ['sass', 'scripts', 'jade'], function() {
    browserSync.init({ // Выполняем browser Sync
        server: { // Определяем параметры сервера
            baseDir: 'dist' // Директория для сервера - dist
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('sass', function(){
    return gulp.src('app/sass/**/*.+(scss|sass)') // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(plumber())
        .pipe(sass())
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(autoprefixer(['last 3 versions'],{ cascade: true })) // Создаем префиксы
        .pipe(gulp.dest('dist/css')) // Выгружаем результат в папку dist/css
        .pipe(browserSync.reload({stream: true})); // Обновляем CSS на странице при изменении
});

gulp.task('jade', function() {
    return gulp.src('app/jade/index.jade')
        .pipe(plumber())
        .pipe(jade({pretty:true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function() {
    return gulp.src([ // Все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', //  jQuery
        'app/libs/lightslider/dist/js/lightslider.min.js'
    ])
        .pipe(plumber())
        .pipe(concat('libs.min.js'))  // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('dist/js'));  // Выгружаем в папку app/js
});

//-------------------------------------------------Synchronization 
gulp.task('imageSync', function () {
	return gulp.src('')
        .pipe(plumber())
		.pipe(dirSync('app/img/', 'dist/img', {printSummary: true}))
		.pipe(browserSync.stream());
});

gulp.task('fontsSync', function () {
	return gulp.src('')
        .pipe(plumber())
		.pipe(dirSync('app/fonts', 'dist/fonts', {printSummary: true}))
		.pipe(browserSync.stream());
});

gulp.task('jsSync', function () {
	return gulp.src('app/js/*.js')
        .pipe(plumber())
		.pipe(gulp.dest('dist/js/'))
		.pipe(browserSync.stream());
});
//--------------


gulp.task('watch', ['browser-sync','sass','scripts'], function() {
    gulp.watch('app/sass/**/*.+(scss|sass)',['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('app/jade/*.jade', ['jade']); // Наблюдение за jade файлами
    gulp.watch('dist/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('dist/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});
gulp.task('default', ['browser-sync','imageSync','fontsSync','jsSync','watch']);


gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку  перед сборкой
});

gulp.task('clear', function() {
    return cache.clearAll(); // Чистим Cache
});

gulp.task('minify', function() { //Минифицируем  Html и переносим  в продакшен
  return gulp.src('dist/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'))
});

gulp.task('img', function() {
    return gulp.src('dist/img/**/*') // Берем все изображения из dist
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img')); // Выгружаем на продакшен
});



gulp.task('build', ['clean','minify','img','sass', 'scripts'], function() {

    var buildCss = gulp.src([                       // Переносим CSS стили в продакшен
        'dist/css/*.min.css'
         ])
        .pipe(cssnano()) // Сжимаем
        .pipe(gulp.dest('build/css'));

    var buildFonts = gulp.src('dist/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('build/fonts'));

    var buildJs = gulp.src('dist/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('build/js'));
});


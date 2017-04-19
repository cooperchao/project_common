/**
 *  Updated  - 2017/04/10
 *  version  - v.1.0
 *  description  - 定義二階段任務 [ 開發階段, 釋出階段 ]
 */

/* ----------------------------------------
** 安裝 & 引入相關套件
---------------------------------------- */

// gulp 組件 [ $ npm install --save-dev gulp ]
const gulp = require('gulp');
// 編譯 Sass or Scss [ $ npm install --save-dev gulp-sass ]
const sass = require('gulp-sass');
// 合併檔案 [ $ npm install --save-dev gulp-concat ]
const concat = require('gulp-concat');
// 重新命名檔案 [ $ npm install gulp-rename ]
const rename = require('gulp-rename');
// 混淆並壓縮 Javascript [ $ npm install --save-dev gulp-uglify ]
const uglify = require('gulp-uglify');
// 模組化錯誤訊息 [ $ npm install pump ]
const pump = require('pump');
// 壓縮 html [ $ npm install gulp-htmlmin ]
const htmlmin = require('gulp-htmlmin');
// 自動重載頁面 [ $ npm install gulp-livereload]
const livereload = require('gulp-livereload');
// 自動化多國語系 [ $ npm install gulp-html-i18n ]
const i18n = require('gulp-html-i18n');
// 取代 html 文本 [ $ npm install gulp-html-replace ]
const htmlreplace = require('gulp-html-replace');
// 刪除資料夾 [ $ npm install gulp-clean ]
const clean = require('gulp-clean');


/* ----------------------------------------
** 共用路徑
---------------------------------------- */

const paths = {
  root: '.',
  originalCss: './css',
  originalJs: './scripts',
  originalScss: './scss',
  build: './build',
  buildCss: './build/css',
  buildScript: './build/scripts',
  buildLang: './build/lang'
};


/* ----------------------------------------
** 開發階段任務
---------------------------------------- */


// 01.初始化事件監聽
gulp.task('watch', () => {
  // 啟動監聽 livereload
  livereload.listen();
  // 監聽指定目錄下的 Scss 檔案
  gulp.watch(`${paths.originalScss}/*.scss`, ['watchStyle']);
  // 監聽指定目錄下的 HTML 檔案
  gulp.watch(`${paths.root}/*.html`, ['watchHtml']);
  // 監聽指定目錄下的 Script 檔案
  gulp.watch(`${paths.originalJs}/*.js`, ['watchJs']);
});

// 02.編譯 & 壓縮 & 監看 sass / scss 檔案
gulp.task('watchStyle', (cb) => {
  // 模組化錯誤訊息事件
  pump(
    [
      // 指定要處理的檔案目錄
      gulp.src(`${paths.originalScss}/*.scss`),
      // 編譯scss
      sass({
        // 指定編譯出的 css 檔案縮排樣式
        outputStyle: 'compressed'
      }),
      // 合併為指定檔名檔案
      concat('all.css'),
      // 指定完成任務後的檔案目錄
      gulp.dest(paths.originalCss),
      // 當檔案異動後自動重載頁面
      livereload()
    ], cb);
});

// 03.監看 Html
gulp.task('watchHtml', (cb) => {
  // 指定要處理的檔案目錄
  gulp.src(`${paths.root}/*.html`)
    // 當檔案異動後自動重載頁面
    .pipe(livereload());
  cb();
});

// 04.監看 JavaScript
gulp.task('watchJs', (cb) => {
  gulp.src(`${paths.originalJs}/*.js`)
    .pipe(livereload());
  cb();
});


/* ----------------------------------------
** 釋出階段任務
---------------------------------------- */

// 01.清除資料夾 build
gulp.task('cleanBuild', () => {
  // 指定異步處理的檔案目錄
  const stream = gulp.src(`${paths.build}`, {
    read: false
  }).pipe(clean());
  return stream;
});

// 02.編譯 & 壓縮 & 監看 sass / scss 檔案
gulp.task('buildAllCss', ['cleanBuild'], () => {
  // 指定要處理的檔案目錄
  const stream = gulp.src(`${paths.originalScss}/**/*.scss`)
    // 編譯 scss 指定編譯出的 css 檔案縮排樣式
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    // 合併為指定檔名檔案
    .pipe(concat('all'))
    // 重新命名檔案並添加後綴名稱
    .pipe(rename({
      suffix: '.min',
      extname: '.css'
    }))
    // 指定完成任務後的檔案目錄
    .pipe(gulp.dest(paths.buildCss));
  return stream;
});


// 03.混淆並壓縮 JavaScript, 並打包至指定目錄
gulp.task('buildJs', ['buildAllCss'], (cb) => {
  // 模組化錯誤訊息事件
  pump([
    // 指定要處理的檔案目錄
    gulp.src(`${paths.originalJs}/*.js`),
    // 將 JavaScript 混淆並最小化 (minify)
    uglify(),
    // 指定完成任務後的檔案目錄
    gulp.dest(paths.buildScript)
  ], cb);
});

// 04.自動化多國語系 i18n
gulp.task('i18n', ['cleanBuild'], () => {
  const langjson = './lang';
  // 指定異步處理的檔案目錄
  const stream = gulp.src(`${paths.root}/*.html`)
    // 依自訂格式選項,進行文本轉譯
    .pipe(i18n({
      // 如果true，而不是翻譯index.html成index-en.html等等，將轉換為en/index.html等
      createLangDirs: true,
      // 指定查找定義的路徑
      langDir: langjson,
      // 保留HTML插入查找定義註解
      trace: false
    }))
    // 指定完成任務後的檔案目錄
    .pipe(gulp.dest(paths.buildLang));
  return stream;
});

// 05.取代 html 引入檔案連結路徑
gulp.task('htmlreplace', ['i18n'], () => {
  // 指定異步處理的檔案目錄
  const stream = gulp.src(`${paths.buildLang}/**/*.html`)
    // 替換原始引入 css, js 檔案路徑
    .pipe(
      htmlreplace({
        css: {
          src: '../../css/all.min.css',
          tpl: '<link rel="stylesheet" href="%s">'
        },
        js: {
          src: '../../scripts/test.js',
          tpl: '<script src="%s"></script>'
        }
      }, {
        // 是否使用未使用的名稱(保留塊或刪除)
        keepUnassigned: false,
        // 是否保留註釋(保留或刪除)
        keepBlockTags: false,
        // 嘗試解析相對路徑
        resolvePaths: false
      }))
    .pipe(gulp.dest(paths.buildLang));
  return stream;
});

// 06.最小化壓縮 Html
gulp.task('htmlmin', ['htmlreplace'], () => {
  // 最小化 html 選項
  const opts = {
    // 折疊對文檔樹中的文本節點有貢獻的空白空間
    collapseWhitespace: true,
    // 指定最大行長度。壓縮的輸出將以有效的HTML拆分點的換行符分割
    maxLineLength: 100,
    // 移除HTML註解
    removeComments: false
  };
  // 指定要處理的 HTML 檔案目錄
  const stream = gulp.src(`${paths.buildLang}/**/*.html`)
    // 依自訂格式選項,最小化 html 檔案
    .pipe(htmlmin(opts))
    // 指定完成任務後的檔案目錄
    .pipe(gulp.dest(paths.buildLang));
  // 返回一个 stream 來表示它已經被完成
  return stream;
});


/* ----------------------------------------
** 自動化釋出任務
---------------------------------------- */

gulp.task('buildStart', ['buildAllCss', 'buildJs', 'htmlmin']);

// 01.清除資料夾 build
// gulp.task('build01', ['cleanBuild'], (cb) => {
//   // 02.編譯 & 壓縮 & 監看 sass / scss 檔案
//   gulp.start('buildAllCss');
//   // 03.混淆並壓縮 JavaScript, 並打包至指定目錄
//   gulp.start('buildJs');
//   // 04.自動化多國語系 i18n
//   gulp.start('i18n');
//   console.log('build01');
//   cb();
// });
//
// // 05.取代 html 引入檔案連結路徑
// gulp.task('build02', ['build01', 'i18n'], (cb) => {
//   // gulp.task('build02', ['build01', 'buildAllCss', 'buildJs', 'i18n'], (cb) => {
//   gulp.start('htmlreplace');
//   console.log('build02');
//   cb();
// });
//
// // 06.最小化壓縮 Html
// gulp.task('buildStart', ['build02', 'htmlreplace'], () => {
//   gulp.start('htmlmin');
// });

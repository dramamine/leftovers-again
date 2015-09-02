'use strict';

var path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    preprocessors: {
      'src/**/*.js': ['babel'],
      'test/**/*.js': ['babel']
    },

    files: [
      'test/**/*.js'
    ],
    frameworks: ['jasmine'],
    exclude: ['coverage', 'flash', 'node_modules', 'test-results'],
    logLevel: config.LOG_INFO,
    colors: true,
    autoWatch: false,
    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    },
    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // browsers: ['PhantomJS'],
    reporters: ['dots', 'coverage', 'html'],
    htmlReporter: {
      outputFile: './test-results/units.html'
    },
    browsers: ['PhantomJS'],
    coverageReporter: {
      dir: './coverage',
      includeAllSources: true,
      reporters: [
        { type: 'html', subdir: 'report-html' },
        // For Jenkins
        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' }
      ]
    },
    captureTimeout: 20000,
    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-babel-preprocessor'
    ]
  });
};

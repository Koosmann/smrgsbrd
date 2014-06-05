/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    cssmin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
      dist: {
        /*files: {
          'dist/css/main.css': [
            //'bower_components/font-awesome/css/font-awesome.css',
            'src/css/normalize.css',
            'src/css/lib/bootstrap-responsive.css',
            'src/css/lib/bootstrap-tooltip-tables-grid.css',
            'src/css/main.css'
            ]
        }*/
        files: {
          'dist/css/intro.css': [
            //'bower_components/font-awesome/css/font-awesome.css',
            //'src/css/normalize.css',
            //'src/css/lib/bootstrap-responsive.css',
            'src/css/lib/bootstrap-tooltip-tables-grid.css',
            'src/css/intro.css'
            ]
        }
      },
      admin: {
        files: {
            'dist/css/admin.css': [
            //'bower_components/font-awesome/css/font-awesome.css',
            'bower_components/bootstrap/dist/css/bootstrap.min.css',
            'src/css/admin.css'
            ]
        }
      }
    },
    imagemin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
      dist: {
        files: [{
          'dist/img/loading.gif': 'src/img/Pictorally_loading_v2.gif',
          'dist/img/mountains.jpg': 'src/img/mountains.jpg',
          'dist/img/avatar.jpg': 'src/img/avatar.jpg',
          'dist/img/frames-intro.png': 'src/img/Intro-bg-3.png',
          'dist/img/frames-night.png': 'src/img/Intro-bg.png',
          'dist/img/frames-day.png': 'src/img/Intro-bg-2.png',
          'dist/img/icon-discover.png': 'src/img/Intro-Icon1.png',
          'dist/img/icon-curate.png': 'src/img/Intro-Icon2.png',
          'dist/img/icon-share.png': 'src/img/Intro-Icon3.png',
          'dist/img/logo.png': 'src/img/logo.png',
          'dist/img/logo-mini.png': 'src/img/logo-mini.png',
          'dist/img/nav-sprite.png': 'src/img/nav-sprite.png',
          'dist/img/sidebar-open.png': 'src/img/sidebar-open.png',
          'dist/img/icon-check-it-out.gif': 'src/img/icon-check-it-out.gif',
          'dist/img/icon-check-it-out-300.gif': 'src/img/icon-check-it-out-300.gif',
          'dist/img/icon-open247.png': 'src/img/icon-open247.png',
          'dist/img/icon-no-shirts.png': 'src/img/icon-no-shirts.png',
          'dist/img/circle-logo-white.png': 'src/img/circle-logo-white.png',
          'dist/img/ticker.png': 'src/img/ticker.png',
          'dist/img/snapshots.png': 'src/img/snapshots.png',
          'dist/img/badge-16.png': 'src/img/badge-16.png',
          'dist/img/badge-24.png': 'src/img/badge-24.png',
          'dist/img/badge-32.png': 'src/img/badge-32.png',
          'dist/img/badge-48.png': 'src/img/badge-48.png',
          'dist/img/plate.png': 'src/img/plate.png'
        }, {
          expand: true,     // Enable dynamic expansion.
          cwd: 'src/img/',      // Src matches are relative to this path.
          src: ['avatars/*.png'], // Actual pattern(s) to match.
          dest: 'dist/img/',   // Destination path prefix.
          ext: '.png'   // Dest filepaths will have this extension.
        }]
      }
    },
    favicons: {
      options: {
        // Task-specific options go here.
      },
      dist: {
        src: 'src/img/icon.png',
        dest: 'dist/img'
      },
    },
    compress: {
      main: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'dist/',
        src: ['**/*'],
        dest: 'dist/'
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['lib/<%= pkg.name %>.js',
              'bower_components/modernizr/modernizr.js',
              'bower_components/jquery/jquery.js',
              'bower_components/angular/angular.js',
              'bower_components/angular-route/angular-route.js',
              'bower_components/angular-cookies/angular-cookies.js',
              'bower_components/angular-resource/angular-resource.js',
              'bower_components/angular-sanitize/angular-sanitize.js',
              'bower_components/angular-animate/angular-animate.js',
              'bower_components/angular-bootstrap/ui-bootstrap.js',
              'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
              'bower_components/underscore/underscore.js',
              'bower_components/jquery-bridget/jquery.bridget.js',
              'bower_components/get-style-property/get-style-property.js',
              'bower_components/get-size/get-size.js',
              'bower_components/eventEmitter/EventEmitter.js',
              'bower_components/eventie/eventie.js',
              'bower_components/doc-ready/doc-ready.js',
              'bower_components/matches-selector/matches-selector.js',
              'bower_components/outlayer/item.js',
              'bower_components/outlayer/outlayer.js',
              'bower_components/masonry/masonry.js',
              'bower_components/imagesloaded/imagesloaded.js',
              'bower_components/angular-masonry/angular-masonry.js',
              'src/js/app.js',
              'src/js/controllers.js',
              'src/js/routes.js',
              'src/js/directives.js',
              'src/js/components.js',
              'src/js/services.js',
              'src/js/filters.js'
              ],
        dest: 'dist/js/<%= pkg.name %>.js'
      },
      admin: {
        src: ['lib/<%= pkg.name %>.js',
              'bower_components/modernizr/modernizr.js',
              'bower_components/jquery/jquery.js',
              'bower_components/angular/angular.js',  
              'bower_components/angular-route/angular-route.js',
              'bower_components/angular-cookies/angular-cookies.js',
              'bower_components/angular-resource/angular-resource.js',
              'bower_components/angular-sanitize/angular-sanitize.js',
              'bower_components/angular-animate/angular-animate.js',
              'bower_components/bootstrap/dist/js/bootstrap.min.js',
              'bower_components/angular-bootstrap/ui-bootstrap.js',
              'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
              'bower_components/underscore/underscore.js',
              'src/js/app.js',
              'src/js/controllers.js',
              'src/js/adminControllers.js',
              'src/js/adminRoutes.js',
              'src/js/directives.js',
              'src/js/components.js',
              'src/js/services.js',
              'src/js/filters.js'
              ],
        dest: 'dist/js/<%= pkg.name %>-admin.js'
      }
    },
    ngmin: {
      dist: {
        src:  '<%= concat.dist.dest %>',
        dest: '<%= concat.dist.dest %>'
      },
      admin: {
        src:  '<%= concat.admin.dest %>',
        dest: '<%= concat.admin.dest %>'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        compress: {
          drop_console: true
        }
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      },
      admin: {
        src: '<%= concat.admin.dest %>',
        dest: 'dist/js/<%= pkg.name %>-admin.min.js'
      }
    },
    // Need to automate inclusion before this is easy to accomplish
    hash: {
      options: {
      },
      dist: {
        src:  '<%= uglify.dist.dest %>',
        dest: '<%= uglify.dist.dest %>'
      },
      admin: {
        src:  '<%= uglify.admin.dest %>',
        dest: '<%= uglify.admin.dest %>'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-favicons');
  grunt.loadNpmTasks('grunt-remove-logging');
  grunt.loadNpmTasks('grunt-hash');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'ngmin', 'cssmin', 'imagemin', 'uglify']);

  // Default task.
  grunt.registerTask('dev', ['jshint', 'concat', 'cssmin']);

};

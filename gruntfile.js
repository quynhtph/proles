module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }	  	  
    },
	
	/*react:{
		single_file_output: {
			files: {
				'build/output.js': 'src/helloReact.jsx'
			}
		}
	}*/
	
	react: {
            dynamic_mappings: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.jsx'],
                    dest: 'build',
                    ext: '.js'
                }],
                options: {
                    ignoreMTime: true
                }
            },
            options: {
                ignoreMTime: true
            }
    }
	
	/*concat: {
            concat_dev: {
                files: {
                    'build/allpart.js': [
                        'src/part1.js',
                        'src/part2.js'
                    ]
                }
            }            
        }*/	
		
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-react');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'concat:concat_dev']);
  grunt.registerTask('concat1', ['concat']);
  grunt.registerTask('react1', ['react:dynamic_mappings']);

};
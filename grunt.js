module.exports = function(grunt) {
		'use strict';

		grunt.initConfig({
				lint: {
						files: ['**/*.js']
				},
				test: {
						files: ['tests/**/*_test.js']
				},
				watch: {
						files: '<config:lint.files>',
						tasks: 'test'
				}
		});

		grunt.registerTask('default', 'test');
};


module.exports = function(grunt) {
  grunt.initConfig({
    pkgFile: 'package.json',
    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    },
    bump: {
      options: {
        commitMessage: 'chore: release v%VERSION%',
        pushTo: 'origin'
      }
    },
    'auto-release': {
      options: {
        checkTravisBuild: false
      }
    }
  });
  grunt.loadNpmTasks('grunt-npm');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-auto-release');
  return grunt.registerTask('release', 'Bump the version and publish to NPM.', function(type) {
    return grunt.task.run(['npm-contributors', "bump:" + (type || 'patch'), 'npm-publish']);
  });
};

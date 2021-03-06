'use strict';

var assert = require('ember-cli/tests/helpers/assert');

describe('the index', function() {
  var subject, mockUi;

  beforeEach(function() {
    subject = require('../../index');
    mockUi = {
      messages: [],
      write: function() { },
      writeLine: function(message) {
        this.messages.push(message);
      }
    };
  });

  it('has a name', function() {
    var result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(result.name, 'test-plugin');
  });

  it('implements the correct hooks', function() {
    var plugin = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.typeOf(plugin.configure, 'function');
    assert.typeOf(plugin.didBuild, 'function');
  });

  describe('configure hook', function() {
    it('resolves if config is ok', function() {
      var plugin = subject.createDeployPlugin({
        name: 'revision-key'
      });

      var context = {
        ui: mockUi,
        config: {
          "revision-key": {
            type: 'file-hash',
            filePattern: 'eeee'
          }
        }
      };

      plugin.beforeHook(context);
      plugin.configure(context);
      assert.ok(true); // it didn't throw
    });
    it('warns about missing optional config', function() {
      var plugin = subject.createDeployPlugin({
        name: 'revision-key'
      });

      var context = {
        ui: mockUi,
        config: {
          "revision-key": {
          }
        }
      };

      plugin.beforeHook(context);
      plugin.configure(context);

      var messages = mockUi.messages.reduce(function(previous, current) {
        if (/- Missing config:\s.*, using default:\s/.test(current)) {
          previous.push(current);
        }

        return previous;
      }, []);

      assert.equal(messages.length, 4);
    });

    it('adds default config to the config object', function() {
      var plugin = subject.createDeployPlugin({
        name: 'revision-key'
      });

      var context = {
        ui: mockUi,
        config: {
          "revision-key": {
          }
        }
      };

      plugin.beforeHook(context);
      plugin.configure(context);

      assert.isDefined(context.config['revision-key'].type);
      assert.isDefined(context.config['revision-key'].filePattern);
    });
  });

  describe('didBuild hook', function() {
    it('returns the revisionKey', function() {
      var plugin = subject.createDeployPlugin({
        name: 'revision-key'
      });

      var context = {
        distDir: 'tests/fixtures',
        distFiles: ['index.html'],
        ui: mockUi,
        config: {
          "revision-key": {
            type: 'file-hash',
            filePattern: 'index.html',
            distDir: function(context) {
              return context.distDir;
            },
            distFiles: function(context) {
              return context.distFiles;
            }
          },
        }
      };
      plugin.beforeHook(context);

      return assert.isFulfilled(plugin.didBuild(context))
        .then(function(result) {
          assert.equal(result.revisionKey, 'ae1569f72495012cd5e8588e0f2f5d49');
        });
    });
  });
});


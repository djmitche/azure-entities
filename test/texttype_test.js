var subject = require('../src/entity');
var assert  = require('assert');
var slugid  = require('slugid');
var _       = require('lodash');
var crypto  = require('crypto');
var helper  = require('./helper');

var Item = subject.configure({
  version:          1,
  partitionKey:     subject.keys.StringKey('id'),
  rowKey:           subject.keys.StringKey('name'),
  properties: {
    id:             subject.types.String,
    name:           subject.types.String,
    data:           subject.types.Text,
  },
});

helper.contextualSuites('Entity (TextType)', helper.makeContexts(Item),
  function(context, options) {
    var Item = options.Item;

    setup(function() {
      return Item.ensureTable();
    });

    // Construct a large string
    var randomString = function(kbytes) {
      var s = 'abcefsfcccsrcsdfsdfsfrfdefdwedwiedowijdwoeidnwoifneoifnweodnwoid';
      s += s; // 128
      s += s; // 256
      s += s; // 512
      s += s; // 1024
      var arr = [];
      for (var i = 0; i < kbytes; i++) {
        arr.push(s);
      }
      return arr.join('');
    };

    test('largeString helper', function() {
      var text  = randomString(64);
      assert(text.length === 1024 * 64);
    });

    test('small text', function() {
      var id    = slugid.v4();
      var text  = 'Hello World';
      return Item.create({
        id:     id,
        name:   'my-test-item',
        data:   text,
      }).then(function(itemA) {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        }).then(function(itemB) {
          assert(itemA.data === itemB.data);
          assert(text === itemB.data);
        });
      });
    });

    test('large text (64k)', function() {
      var id    = slugid.v4();
      var text  = randomString(64);
      return Item.create({
        id:     id,
        name:   'my-test-item',
        data:   text,
      }).then(function(itemA) {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        }).then(function(itemB) {
          assert(itemA.data === itemB.data);
          assert(text === itemB.data);
        });
      });
    });

    test('large text (128k)', function() {
      var id    = slugid.v4();
      var text  = randomString(128);
      return Item.create({
        id:     id,
        name:   'my-test-item',
        data:   text,
      }).then(function(itemA) {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        }).then(function(itemB) {
          assert(itemA.data === itemB.data);
          assert(text === itemB.data);
        });
      });
    });

    test('large text (256k)', function() {
      var id    = slugid.v4();
      var text  = randomString(256);
      return Item.create({
        id:     id,
        name:   'my-test-item',
        data:   text,
      }).then(function(itemA) {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        }).then(function(itemB) {
          assert(itemA.data === itemB.data);
          assert(text === itemB.data);
        });
      });
    });
  });

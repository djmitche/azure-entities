var subject = require('../src/entity');
var assert  = require('assert');
var slugid  = require('slugid');
var _       = require('lodash');
var Promise = require('promise');
var crypto  = require('crypto');
var helper  = require('./helper');

var Item = subject.configure({
  version:          1,
  partitionKey:     subject.keys.StringKey('id'),
  rowKey:           subject.keys.StringKey('name'),
  properties: {
    id:             subject.types.String,
    name:           subject.types.String,
    data:           subject.types.EncryptedBlob,
  },
});

helper.contextualSuites('Entity (EncryptedBlobType)', helper.makeContexts(Item, {
  cryptoKey:    'CNcj2aOozdo7Pn+HEkAIixwninIwKnbYc6JPS9mNxZk=',
}), function(context, options) {
  var Item = options.Item;

  setup(function() {
    return Item.ensureTable();
  });

  var compareBuffers = function(b1, b2) {
    assert(Buffer.isBuffer(b1));
    assert(Buffer.isBuffer(b2));
    if (b1.length !== b2.length) {
      return false;
    }
    var n = b1.length;
    for (var i = 0; i < n; i++) {
      if (b1[i] !== b2[i]) {
        return false;
      }
    }
    return true;
  };

  test('small blob', function() {
    var id  = slugid.v4();
    var buf = Buffer.from([0, 1, 2, 3]);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   buf,
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item',
      }).then(function(itemB) {
        assert(compareBuffers(itemA.data, itemB.data));
      });
    });
  });

  test('large blob (64k)', function() {
    var id  = slugid.v4();
    var buf = crypto.pseudoRandomBytes(64 * 1024);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   buf,
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item',
      }).then(function(itemB) {
        assert(compareBuffers(itemA.data, itemB.data));
      });
    });
  });

  test('large blob (128k)', function() {
    var id  = slugid.v4();
    var buf = crypto.pseudoRandomBytes(128 * 1024);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   buf,
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item',
      }).then(function(itemB) {
        assert(compareBuffers(itemA.data, itemB.data));
      });
    });
  });

  test('large blob (256k - 32)', function() {
    var id  = slugid.v4();
    var buf = crypto.pseudoRandomBytes(256 * 1024 - 32);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   buf,
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item',
      }).then(function(itemB) {
        assert(compareBuffers(itemA.data, itemB.data));
      });
    });
  });
});

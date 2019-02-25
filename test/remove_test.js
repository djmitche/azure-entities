var subject = require('../src/entity');
var assert  = require('assert');
var slugid  = require('slugid');
var _       = require('lodash');
var helper  = require('./helper');

var Item = subject.configure({
  version:          1,
  partitionKey:     subject.keys.StringKey('id'),
  rowKey:           subject.keys.StringKey('name'),
  properties: {
    id:             subject.types.String,
    name:           subject.types.String,
    count:          subject.types.Number,
  },
});

helper.contextualSuites('Entity (remove)', helper.makeContexts(Item),
  function(context, options) {
    var Item = options.Item;

    setup(function() {
      return Item.ensureTable();
    });

    test('Item.create, item.remove', function() {
      var id = slugid.v4();
      return Item.create({
        id:     id,
        name:   'my-test-item',
        count:  1,
      }).then(function(item) {
        assert(item instanceof Item);
        assert(item.id === id);
        assert(item.count === 1);
        return item.remove();
      }).then(function() {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        });
      }).catch(function(err) {
        assert(err.code === 'ResourceNotFound');
      });
    });

    test('Item.create, Item.remove', function() {
      var id = slugid.v4();
      return Item.create({
        id:     id,
        name:   'my-test-item',
        count:  1,
      }).then(function(item) {
        return Item.remove({
          id:     id,
          name:   'my-test-item',
        });
      }).then(function() {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        });
      }).catch(function(err) {
        assert(err.code === 'ResourceNotFound');
      });
    });

    test('Item.remove (error when doesn\'t exist)', function() {
      return Item.remove({
        id:     slugid.v4(),
        name:   'my-test-item',
      }).catch(function(err) {
        assert(err.code === 'ResourceNotFound');
      });
    });

    test('Item.remove (ignoreIfNotExists)', function() {
      return Item.remove({
        id:     slugid.v4(),
        name:   'my-test-item',
      }, true);
    });

    test('Item.create, item.remove (abort if changed)', function() {
      var id = slugid.v4();
      return Item.create({
        id:     id,
        name:   'my-test-item',
        count:  1,
      }).then(function(itemA) {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        }).then(function(itemB) {
          return itemB.modify(function() {
            this.count += 1;
          });
        }).then(function() {
          return itemA.remove();
        });
      }).catch(function(err) {
        assert(err.code === 'UpdateConditionNotSatisfied');
      });
    });

    test('Item.create, item.remove (ignore changes)', function() {
      var id = slugid.v4();
      return Item.create({
        id:     id,
        name:   'my-test-item',
        count:  1,
      }).then(function(itemA) {
        return Item.load({
          id:     id,
          name:   'my-test-item',
        }).then(function(itemB) {
          return itemB.modify(function() {
            this.count += 1;
          });
        }).then(function() {
          return itemA.remove(true);
        });
      });
    });

    test('Item.create, item.remove (ignoreIfNotExists)', function() {
      var id = slugid.v4();
      return Item.create({
        id:     id,
        name:   'my-test-item',
        count:  1,
      }).then(function(itemA) {
        return itemA.remove(false, false).then(function() {
          return itemA.remove(false, true);
        });
      });
    });

    test('Item.create, Item.remove (ignoreIfNotExists)', function() {
      var id = slugid.v4();
      return Item.create({
        id:     id,
        name:   'my-test-item',
        count:  1,
      }).then(function() {
        return Item.remove({
          id:     id,
          name:   'my-test-item',
        }, false).then(function(result) {
          assert(result === true, 'Expected true');
          return Item.remove({
            id:     id,
            name:   'my-test-item',
          }, true).then(function(result) {
            assert(result === false, 'Expected false');
          });
        });
      });
    });
  });

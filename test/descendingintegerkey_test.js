var subject = require('../src/entity');
var assert  = require('assert');
var slugid  = require('slugid');
var _       = require('lodash');
var crypto  = require('crypto');
var debug   = require('debug')('test:entity:descendingintegerkey');
var helper  = require('./helper');

var Item = subject.configure({
  version:          1,
  partitionKey:     subject.keys.StringKey('id'),
  rowKey:           subject.keys.DescendingIntegerKey('rev'),
  properties: {
    id:             subject.types.SlugId,
    rev:            subject.types.PositiveInteger,
    text:           subject.types.String,
  },
});

helper.contextualSuites('Entity (DescendingIntegerKey)',
  helper.makeContexts(Item), function(ctx, options) {
    let Item;
    suiteSetup(function() {
      Item = options().Item;
    });
    let text = slugid.v4();

    setup(function() {
      return Item.ensureTable();
    });

    test('Item.create, Item.load', async () => {
      let id = slugid.v4();
      await Item.create({id, rev: 0, text});
      let item = await Item.load({id, rev: 0});
      assert(item.text === text);
    });

    test('Can\'t modify key', async () => {
      let id = slugid.v4();
      let item = await Item.create({id, rev: 0, text});
      try {
        await item.modify(item => {
          item.rev = 1;
        });
      } catch (err) {
        debug('expected error: %s', err);
        return;
      }
      assert(false, 'expected an error');
    });

    test('Can\'t use negative numbers', async () => {
      let id = slugid.v4();
      try {
        await Item.create({id, rev: -1, text});
      } catch (err) {
        debug('expected error: %s', err);
        return;
      }
      assert(false, 'expected an error');
    });

    test('Preserve ordering listing a partition', async () => {
      let id = slugid.v4();
      await Item.create({id, rev: 1, text: 'B'});
      await Item.create({id, rev: 14, text: 'D'});
      await Item.create({id, rev: 0, text: 'A'});
      await Item.create({id, rev: 2, text: 'C'});
      await Item.create({id, rev: 200, text: 'E'});
      let {entries} = await Item.query({id});
      let revs = entries.map(item => item.rev);
      assert(_.isEqual(revs, [200, 14, 2, 1, 0]), 'wrong revision order');
      assert(_.isEqual(entries.map(item => item.text), [
        'E', 'D', 'C', 'B', 'A',
      ]), 'wrong order of text properties');
    });
  });

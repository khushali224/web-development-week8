const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeRegex, parsePagination } = require('../server/utils/helpers');

test('escapeRegex makes user search text literal', () => {
  assert.equal(escapeRegex('react.*(js)'), 'react\\.\\*\\(js\\)');
  assert.equal(new RegExp(escapeRegex('C++')).test('C++'), true);
  assert.equal(new RegExp(escapeRegex('C++')).test('CCCC'), false);
});

test('parsePagination applies documented defaults', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 10, skip: 0 });
});

test('parsePagination calculates offsets and permits maximum limit', () => {
  assert.deepEqual(parsePagination({ page: '3', limit: '100' }), {
    page: 3,
    limit: 100,
    skip: 200
  });
});

test('parsePagination rejects invalid, unsafe, and out-of-range values', () => {
  for (const query of [
    { page: '0' },
    { page: '-1' },
    { page: '9007199254740992' },
    { page: '100000000000000000', limit: '100' },
    { limit: '0' },
    { limit: '101' },
    { limit: '1.5' }
  ]) {
    assert.throws(() => parsePagination(query));
  }
});

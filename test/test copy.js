import test from 'ava';
import Pageres from '../';

process.chdir(__dirname);

test('expose a constructor', t => {
	t.is(typeof Pageres, 'function');
	t.end();
});

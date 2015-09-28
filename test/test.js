import test from 'ava';
import Pageres from '../';

process.chdir(__dirname);

test('return an instance if it called without `new`', t => {
	const pageres = Pageres;
	t.true(pageres() instanceof Pageres);
	t.end();
});

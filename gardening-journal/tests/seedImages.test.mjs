import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSeedCover} from '../backend/services/resolveSeedCover.js';

test('saved image string arrays and upload objects resolve without inventing filenames',()=>{
 assert.equal(resolveSeedCover({coverImage:'missing.jpg',images:['seed/My%20Basil.jpg']},['My Basil.jpg']),'My Basil.jpg');
 assert.equal(resolveSeedCover({images:[{relativePath:'seed/packet.jpg'}]},['packet.jpg']),'packet.jpg');
 assert.equal(resolveSeedCover({coverImage:'garlic_bulb.jpg'},[]),'garlic_bulb.jpg');
});

test('legacy aliases support stored upload paths and casing',()=>{
 assert.equal(resolveSeedCover({coverImage:'/seed/BASIL GENOVESE.JPEG'},['basil-genovese.jpg']),'basil-genovese.jpg');
 assert.equal(resolveSeedCover({coverImage:'https://example.test/original.jpg'},[]),'https://example.test/original.jpg');
});

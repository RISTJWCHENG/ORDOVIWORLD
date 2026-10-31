import test from 'node:test';
import assert from 'node:assert/strict';
import {avatarGradient,avatarMarkup,isAvatarPhoto} from '../web/src/avatar.js';
test('default avatars are stable per principal and do not depend on display names',()=>{assert.equal(avatarGradient('user-alpha'),avatarGradient('user-alpha'));assert.notEqual(avatarGradient('user-alpha'),avatarGradient('user-beta'));assert.match(avatarGradient('user-alpha'),/^linear-gradient\(/);});
test('avatar rendering rejects external URLs and active image formats',()=>{for(const value of ['https://example.org/photo.jpg','data:image/svg+xml;base64,PHN2Zz4=','🪐','data:image/jpeg;base64,'+'A'.repeat(23000)]){assert.equal(isAvatarPhoto(value),false);assert.ok(!avatarMarkup('test',value).includes('<img'));}});

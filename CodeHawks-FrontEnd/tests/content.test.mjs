import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { photos } from '../src/constants/photos.ts';
import { groups, projects } from '../src/constants/projects.ts';

const file = path => existsSync(join(import.meta.dirname, '../public', path));

test('every listed photo has its files', () => {
  for (const photo of photos) {
    if (photo.strip) assert.ok(file(`photos/thumb/${photo.slug}.webp`), `missing thumbnail for ${photo.slug}`);
    if (photo.viewer) assert.ok(file(`photos/${photo.slug}.webp`), `missing full photo for ${photo.slug}`);
  }
  assert.ok(photos.some(photo => photo.slug === 'img-2142' && photo.viewer), 'the viewer opens on img-2142');
});

test('every project has a stage photo, an award group, and https links', () => {
  assert.equal(projects.length, 8);
  assert.equal(new Set(projects.map(project => project.slug)).size, projects.length);
  for (const project of projects) {
    assert.ok(file(`photos/${project.photo.slug}.webp`), `missing stage photo for ${project.slug}`);
    assert.ok(groups.some(group => group.id === project.group));
    assert.ok(project.team.length > 0);
    for (const url of [project.source, project.mlh, project.demo].filter(Boolean)) {
      assert.match(url, /^https:\/\//);
      assert.doesNotMatch(url, /utm_/);
    }
  }
});

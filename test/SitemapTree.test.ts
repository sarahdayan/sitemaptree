import path from 'path';
import mock from 'mock-fs';

import { SitemapTree, Resource } from '../src';

let tree: SitemapTree | null = null;

beforeAll(() => {
  mock({
    path: {
      'first.txt': 'Some content.',
      'second.txt': 'Some other content.',
    },
  });
});

afterEach(() => {
  tree = null;
});

afterAll(() => {
  mock.restore();
});

describe('SitemapTree', () => {
  describe('initialization', () => {
    beforeEach(() => {
      tree = new SitemapTree();
    });
    it('returns a null resource', () => {
      expect(tree!.resource).toBeNull();
    });
    it('returns a null parent', () => {
      expect(tree!.parent).toBeNull();
    });
    it('returns empty children', () => {
      expect(tree!.children).toEqual([]);
    });
    it('returns a null URL part', () => {
      expect(tree!.urlPart).toBeNull();
    });
    it('returns a null URL', () => {
      expect(tree!.url).toBeNull();
    });
  });
  describe('#add', () => {
    beforeEach(() => {
      tree = new SitemapTree();

      tree!.add(new Resource(path.normalize('path/first.txt')));
      tree!.add(new Resource(path.normalize('path/second.txt')));
    });
    it('recursively adds the first level of the resource to the tree', () => {
      const child = tree!.children[0];

      expect(child.resource).toBeNull();

      expect(child.parent!.children).toHaveLength(1);
      expect(child.parent!.resource).toBeNull();
      expect(child.parent!.urlPart).toBeNull();
      expect(child.parent!.url).toBeNull();

      expect(child.children).toHaveLength(2);
      expect(child.urlPart).toBe('path');
      expect(child.url).toBe('path');
    });
    it('recursively adds the first child of the second level of the resource to the tree', () => {
      const [child] = tree!.children[0].children;

      expect(child.resource!.source).toBe(path.normalize('path/first.txt'));
      expect(child.resource!.destination).toBe(path.normalize('/path/first/'));
      expect(child.resource!.data).toBe('Some content.');

      expect(child.parent!.children).toHaveLength(2);
      expect(child.parent!.resource).toBeNull();
      expect(child.parent!.urlPart).toBe('path');
      expect(child.parent!.url).toBe('path');

      expect(child.children).toEqual([]);
      expect(child.urlPart).toBe('first');
      expect(child.url).toBe(path.normalize('path/first'));
    });
    it('recursively adds the second child of the second level of the resource to the tree', () => {
      const [, child] = tree!.children[0].children;

      expect(child.resource!.source).toBe(path.normalize('path/second.txt'));
      expect(child.resource!.destination).toBe(path.normalize('/path/second/'));
      expect(child.resource!.data).toBe('Some other content.');

      expect(child.parent!.children).toHaveLength(2);
      expect(child.parent!.resource).toBeNull();
      expect(child.parent!.urlPart).toBe('path');
      expect(child.parent!.url).toBe('path');

      expect(child.children).toEqual([]);
      expect(child.urlPart).toBe('second');
      expect(child.url).toBe(path.normalize('path/second'));
    });
  });
  describe('#siblings', () => {
    beforeEach(() => {
      tree = new SitemapTree();

      tree!.add(new Resource(path.normalize('path/first.txt')));
      tree!.add(new Resource(path.normalize('path/second.txt')));
    });
    it('returns all siblings at the same level', () => {
      const [child] = tree!.children[0].children;

      expect(child.siblings).toHaveLength(2);
    });
    it('returns self from the top node', () => {
      expect(tree!.siblings).toHaveLength(1);
    });
  });
  describe('#fromUrl', () => {
    beforeEach(() => {
      tree = new SitemapTree();

      tree!.add(new Resource(path.normalize('path/first.txt')));
    });
    it('returns sub-trees from URL', () => {
      const subTree = tree!.fromUrl(path.normalize('path/first'));

      expect(subTree.resource!.source).toBe(path.normalize('path/first.txt'));
    });
  });
  describe('#fromResource', () => {
    beforeEach(() => {
      tree = new SitemapTree();
    });
    it('returns sub-trees from URL', () => {
      const resource = new Resource(path.normalize('path/first.txt'));
      tree!.add(resource);

      const subTree = tree!.fromResource(resource);

      expect(subTree.resource!.source).toBe(path.normalize('path/first.txt'));
    });
  });
  describe('#allUrls', () => {
    beforeEach(() => {
      tree = new SitemapTree();

      tree!.add(new Resource(path.normalize('path/first.txt')));
      tree!.add(new Resource(path.normalize('path/second.txt')));
    });
    it('returns all URLs', () => {
      expect(tree!.allUrls).toEqual({
        path: expect.any(SitemapTree),
        [path.normalize('path/first')]: expect.any(SitemapTree),
        [path.normalize('path/second')]: expect.any(SitemapTree),
      });
    });
    it('points to the same object in memory for all sub-trees', () => {
      const subTree = tree!.fromUrl(path.normalize('path/first'));

      expect(tree!.allUrls).toBe(subTree.allUrls);
    });
  });
});

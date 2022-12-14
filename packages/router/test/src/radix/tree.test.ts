import { Tree } from '../../../src/radix/tree';

describe('Tree', () => {
    it('should throw an error when not starting with a /', () => {
        const tree = new Tree('GET');

        expect(() => tree.add('blog', () => {})).toThrow(`Path must begin with '/' in path blog`);
    });

    it('should be possible to add new entries', () => {
        const tree = new Tree('GET');
        tree.add('/blog', () => {});
        tree.add('/blog/:slug', () => {});
        tree.add('/blog/:slug/comments', () => {});

        expect(tree.root?.priority).toEqual(4);
    });

    it('order should be based on priority', () => {
        const tree = new Tree('GET');
        tree.add('/1', () => {});
        tree.add('/2', () => {});
        tree.add('/2/3', () => {});

        expect(tree.root?.priority).toEqual(4);
        expect(tree.root?.children[0].children[0].fullPath).toEqual('/2');
        expect(tree.root?.children[0].children[1].fullPath).toEqual('/1');
    });

    it('should match with similar paths', () => {
        const tree = new Tree('GET');
        tree.add('/test1', () => {});
        tree.add('/test2', () => {});

        expect(tree.get('/test1')).not.toBeNull();
        expect(tree.get('/test2')).not.toBeNull();
        expect(tree.root?.children[0].children[0].fullPath).toEqual('/test1');
        expect(tree.root?.children[0].children[1].fullPath).toEqual('/test2');
    });

    it('should return the path parameters', () => {
        const tree = new Tree('GET');
        tree.add('/blog', () => {});
        tree.add('/blog/:slug', () => {});
        tree.add('/blog/:slug/comments/:commentId', () => {});

        expect(tree.get('/blog')).toEqual({path: '/blog', params: {}, middlewares: [], handler: expect.any(Function)});
        expect(tree.get('/blog/foo')).toEqual({path: '/blog/:slug', params: {slug: 'foo'}, middlewares: [], handler: expect.any(Function)});
        expect(tree.get('/blog/foo/comments/1')).toEqual({path: '/blog/:slug/comments/:commentId', params: {slug: 'foo', commentId: '1'}, middlewares: [], handler: expect.any(Function)});
    });
});
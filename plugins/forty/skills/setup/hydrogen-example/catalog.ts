import {CollectionSchema, ProductSchema, resolved, z} from '@40rty/ams-sdk';
import type {HostComponents} from '@40rty/ams-sdk';

/**
 * What the agent may compose on the `/ask` canvas. Data only — `forty publish`
 * sends this file to the platform, so it must import nothing but `@40rty/ams-sdk`.
 * Each type is drawn in `./components.tsx` and described in `./catalogs/`.
 */
export const catalog: HostComponents['catalog'] = {
  productGrid: {
    type: 'productGrid',
    propsSchema: z.object({
      title: z.string().describe('section heading'),
      products: resolved(ProductSchema, 'product', {min: 1, max: 12}).describe(
        'the products to show',
      ),
    }),
    examples: [
      {
        title: 'Everyday bralettes',
        products: [
          'gid://shopify/Product/<id-1>',
          'gid://shopify/Product/<id-2>',
        ],
      },
    ],
  },
  collectionList: {
    type: 'collectionList',
    propsSchema: z.object({
      title: z.string().describe('section heading'),
      collections: resolved(CollectionSchema, 'collection', {
        min: 2,
        max: 4,
      }).describe('the collections to feature'),
    }),
    examples: [
      {
        title: 'Shop by category',
        collections: [
          'gid://shopify/Collection/<id-1>',
          'gid://shopify/Collection/<id-2>',
        ],
      },
    ],
  },
  collectionHero: {
    type: 'collectionHero',
    propsSchema: z.object({
      collection: resolved(CollectionSchema, 'collection', {
        min: 1,
        max: 1,
      }).describe('the one collection to spotlight'),
      heading: z.string().describe('large headline over the image'),
      byline: z.string().optional().describe('one supporting sentence'),
      cta: z
        .string()
        .optional()
        .describe('short call to action, e.g. "Shop now"'),
    }),
    examples: [
      {
        collection: 'gid://shopify/Collection/<id>',
        heading: 'Soft enough to live in',
        byline: 'Loungewear for the days you stay in.',
        cta: 'Shop loungewear',
      },
    ],
  },
};

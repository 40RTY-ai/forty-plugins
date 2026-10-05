import {CollectionSchema, ProductSchema, resolved, z} from '@40rty/ams-sdk';
import type {HostComponents} from '@40rty/ams-sdk';

/**
 * What the agent may compose on the agentic page's canvas. Data only — `forty publish`
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
  comparisonTable: {
    type: 'comparisonTable',
    propsSchema: z.object({
      products: resolved(ProductSchema, 'product', {min: 2, max: 4}).describe(
        'the DISTINCT products to compare side by side, each at most once',
      ),
      verdict: z
        .string()
        .optional()
        .describe(
          'your one-line call above the table: the pick and the deciding reason, ≤140 chars. Omit only when staying neutral',
        ),
      highlightedProductId: z
        .string()
        .optional()
        .describe('the gid of the pick — one of `products`; set whenever `verdict` names a winner'),
      attributeRows: z
        .array(
          z.object({
            id: z.string().describe('stable slug, e.g. "material"'),
            label: z.string().describe('row label, e.g. "Material"'),
            values: z
              .record(z.union([z.string(), z.number(), z.boolean()]))
              .describe('a value for EVERY product gid in `products`; booleans render ✓/✗'),
            winner: z
              .string()
              .optional()
              .describe('gid of the product that wins this row for the visitor’s stated need; omit on a wash'),
          }),
        )
        .optional()
        .describe(
          'judgment rows only — price, sale and stock are drawn from the products already. Derive values from title, description, tags and variants',
        ),
    }),
    examples: [
      {
        products: ['gid://shopify/Product/<id-1>', 'gid://shopify/Product/<id-2>'],
        verdict: 'Under a white tee, the seamless takes it — no lines show.',
        highlightedProductId: 'gid://shopify/Product/<id-1>',
        attributeRows: [
          {
            id: 'show-through',
            label: 'Shows under white',
            values: {'gid://shopify/Product/<id-1>': 'No', 'gid://shopify/Product/<id-2>': 'Faint seams'},
            winner: 'gid://shopify/Product/<id-1>',
          },
        ],
      },
    ],
  },
  productDetail: {
    type: 'productDetail',
    propsSchema: z.object({
      product: resolved(ProductSchema, 'product', {min: 1, max: 1}).describe('the one product to recommend'),
      reason: z
        .string()
        .optional()
        .describe('one sentence on why this is the one for them, in the store’s voice'),
    }),
    examples: [
      {
        product: 'gid://shopify/Product/<id>',
        reason: 'Soft enough to forget you are wearing it — the one people reorder.',
      },
    ],
  },
};

import {renderInline} from '@40rty/ams-sdk';
import type {HostComponents} from '@40rty/ams-sdk';

import type {
  CollectionContentFragment,
  ProductCardFragment,
} from 'storefrontapi.generated';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {Grid} from '~/components/Grid';
import {Hero} from '~/components/Hero';
import {ProductCard} from '~/components/ProductCard';
import {Heading, Section, Text} from '~/components/Text';

import {catalog} from './catalog';

type FourtyImage = {
  url: string;
  altText: string;
  width?: number;
  height?: number;
};
type FourtyMoney = {amount: number; currencyCode: string};

/** A product as the spacefront hands it to a renderer (hydrated from the store). */
interface FourtyProduct {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  variants: Array<{
    id: string;
    available: boolean;
    price: FourtyMoney;
    compareAtPrice?: FourtyMoney;
    selectedOptions?: Array<{name: string; value: string}>;
    image?: FourtyImage;
  }>;
  images: FourtyImage[];
}

/** A collection as the spacefront hands it to a renderer. */
interface FourtyCollection {
  id: string;
  handle: string;
  title: string;
  image?: FourtyImage;
}

const toMoney = (money: FourtyMoney) => ({
  amount: String(money.amount),
  currencyCode: money.currencyCode,
});

/** Adapt a spacefront product to the fragment `ProductCard` takes. */
function toProductCard(product: FourtyProduct): ProductCardFragment {
  const variant = product.variants[0];
  return {
    id: product.id,
    title: product.title,
    publishedAt: '',
    handle: product.handle,
    vendor: product.vendor,
    variants: {
      nodes: [
        {
          id: variant.id,
          availableForSale: variant.available,
          image: variant.image ?? product.images[0] ?? null,
          price: toMoney(variant.price),
          compareAtPrice: variant.compareAtPrice
            ? toMoney(variant.compareAtPrice)
            : null,
          selectedOptions: variant.selectedOptions ?? [],
          product: {handle: product.handle, title: product.title},
        },
      ],
    },
  } as ProductCardFragment;
}

/** Adapt a spacefront collection, plus the agent's copy, to the fragment `Hero` takes. */
function toHero(
  collection: FourtyCollection,
  copy: {heading?: string; byline?: string; cta?: string},
) {
  const field = (value?: string) => (value ? {value} : null);
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    descriptionHtml: '',
    heading: field(copy.heading ?? collection.title),
    byline: field(copy.byline),
    cta: field(copy.cta),
    spread: collection.image
      ? {
          reference: {
            __typename: 'MediaImage',
            mediaContentType: 'IMAGE',
            alt: collection.image.altText,
            previewImage: {url: collection.image.url},
            image: collection.image,
          },
        }
      : null,
    spreadSecondary: null,
  } as unknown as CollectionContentFragment;
}

function ProductGrid({
  title,
  products,
}: {
  title?: string;
  products?: FourtyProduct[];
}) {
  const withVariants = (products ?? []).filter(
    (product) => typeof product === 'object' && product.variants?.length > 0,
  );
  return (
    <Section heading={title} padding="y">
      <Grid layout="products" className="px-6 md:px-8 lg:px-12">
        {withVariants.map((product) => (
          <ProductCard
            key={product.id}
            product={toProductCard(product)}
            quickAdd
          />
        ))}
      </Grid>
    </Section>
  );
}

function CollectionList({
  title,
  collections,
}: {
  title?: string;
  collections?: FourtyCollection[];
}) {
  const nodes = (collections ?? [])
    .filter((collection) => typeof collection === 'object')
    .map(({id, title, handle, image}) => ({
      id,
      title,
      handle,
      image: image ?? null,
    }));
  return (
    <FeaturedCollections
      title={title}
      collections={
        {nodes} as Parameters<typeof FeaturedCollections>[0]['collections']
      }
    />
  );
}

function CollectionHero({
  collection,
  ...copy
}: {
  collection?: FourtyCollection;
  heading?: string;
  byline?: string;
  cta?: string;
}) {
  if (typeof collection !== 'object') return null;
  // `isolate` keeps Hero's `-z-10` media above the page background.
  return (
    <div className="isolate">
      <Hero {...toHero(collection, copy)} />
    </div>
  );
}

/** The agent's prose on the canvas. */
function AgentText({
  text,
  parts,
}: {
  text?: string;
  parts?: Array<{type: 'text' | 'em'; value: string}>;
}) {
  return (
    <Text as="p" size="lead" width="wide" className="px-6 md:px-8 lg:px-12">
      {parts
        ? parts.map((part, i) =>
            part.type === 'em' ? (
              // eslint-disable-next-line react/no-array-index-key
              <em key={i}>{part.value}</em>
            ) : (
              part.value
            ),
          )
        : text && renderInline(text, 'agent-text')}
    </Text>
  );
}

/** One exchange: the visitor's ask, then whatever the agent composed for it. */
function Turn({
  prompt,
  children,
}: {
  prompt?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 py-6 border-b border-primary/10">
      {prompt && (
        <Heading as="h2" size="lead" className="px-6 md:px-8 lg:px-12">
          “{prompt}”
        </Heading>
      )}
      {children}
    </section>
  );
}

type Renderer = HostComponents['renderers'][string];

export const fortyComponents: HostComponents = {
  catalog,
  renderers: {
    productGrid: ProductGrid as Renderer,
    collectionList: CollectionList as Renderer,
    collectionHero: CollectionHero as Renderer,
    agentText: AgentText as Renderer,
    turn: Turn as Renderer,
  },
};

import {useEffect, useReducer} from 'react';
import {Spacefront} from '@40rty/ams-sdk';
import {useAnalytics} from '@shopify/hydrogen';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

import {fortyComponents} from '~/forty/components';
import {Shell} from '~/forty/Shell';

import fortyConfig from '../../forty.config.json';

/**
 * The visitor's analytics consent, read from Shopify's Customer Privacy API
 * (the same source the store's own `Analytics.Provider` and banner use).
 */
function useConsent(): 'granted' | 'pending' | 'withheld' {
  const {customerPrivacy} = useAnalytics();
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    document.addEventListener('visitorConsentCollected', refresh);
    return () =>
      document.removeEventListener('visitorConsentCollected', refresh);
  }, []);

  if (!customerPrivacy) return 'pending';
  if (customerPrivacy.analyticsProcessingAllowed()) return 'granted';
  // Typed as a boolean by Hydrogen; the Customer Privacy API answers 'yes' | 'no' | ''.
  const analytics = String(customerPrivacy.currentVisitorConsent().analytics);
  return analytics === 'no' || analytics === 'false' ? 'withheld' : 'pending';
}

/**
 * The developer's preview credential, written to `.env` by `forty dev`: with
 * it this page renders their draft. Absent in production, where the space
 * renders what it has published and decides its own access.
 */
export async function loader({context}: LoaderFunctionArgs) {
  return json({token: context.env.FORTY_DEV_TOKEN});
}

export default function Ask() {
  const consent = useConsent();
  const {token} = useLoaderData<typeof loader>();

  return (
    <Spacefront
      spaceSlug={fortyConfig.spaceSlug}
      apiUrl={fortyConfig.apiUrl}
      consent={consent}
      token={token}
      components={fortyComponents}
    >
      <Shell />
    </Spacefront>
  );
}

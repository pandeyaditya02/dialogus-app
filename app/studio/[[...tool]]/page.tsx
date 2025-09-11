/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config.js'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return (
    <>
      <style
        // Only affects the Studio route
        dangerouslySetInnerHTML={{
          __html: `
            /* Hide site header/footer on /studio to prevent overlap */
            #header, header, footer { display: none !important; }

            /* Reset body/container spacing so Studio can use full viewport */
            html, body, #__next { height: 100%; }
            body { margin: 0 !important; padding: 0 !important; background: #fff; }

            /* Neutralize site-specific nav styles that may leak */
            .dark-glass-nav { display: none !important; }
          `,
        }}
      />
      <NextStudio config={config} />
    </>
  )
}

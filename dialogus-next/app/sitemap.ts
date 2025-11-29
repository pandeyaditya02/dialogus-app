import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.dialogus.co.in';

    // Fetch all insight posts
    const query = groq`*[_type == "insightPost"]{
    "slug": slug.current,
    _updatedAt
  }`;
    const posts = await client.fetch(query);

    const postUrls = posts.map((post: any) => ({
        url: `${baseUrl}/insights/${post.slug}`,
        lastModified: new Date(post._updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/videos`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shows`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/shorts`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/insights`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...postUrls,
    ];
}

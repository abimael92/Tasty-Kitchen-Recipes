import sanityClient from '@sanity/client';

export const client = sanityClient({
  projectId: 'n1dow9eo',      // your Sanity project ID
  dataset: 'production',
  apiVersion: '2023-06-25',   // use today's date or your preferred version
  useCdn: true,               // `false` if you want fresh data always
});

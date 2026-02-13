import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'blogPost',
  type: 'document',
  title: 'Blog Post',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      title: 'Excerpt',
      rows: 3,
      validation: (Rule) =>
        Rule.max(160).warning('For best SEO results, keep excerpts under 160 characters'),
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Main Image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for accessibility',
          validation: (Rule) => Rule.required().error('Alt text is required for accessibility'),
        },
      ],
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'Body',
      validation: (Rule) => Rule.required().warning('A blog post needs content'),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published At',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, media, publishedAt } = selection;
      return {
        title,
        media,
        subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date',
      };
    },
  },
  orderings: [
    {
      title: 'Published Date, Newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});

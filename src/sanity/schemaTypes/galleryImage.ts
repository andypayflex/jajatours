import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'galleryImage',
  type: 'document',
  title: 'Gallery Image',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alt',
      type: 'string',
      title: 'Alt Text',
      description: 'Describe the image for accessibility',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Caption',
      description: 'Optional caption displayed below the image',
    }),
    defineField({
      name: 'tour',
      type: 'reference',
      title: 'Tour',
      description: 'Which tour is this photo from?',
      to: [{ type: 'tour' }],
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      description: 'Tags for filtering (e.g., "diving", "landscape", "group")',
      of: [{ type: 'string' }],
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
      title: 'alt',
      media: 'image',
      caption: 'caption',
    },
    prepare(selection) {
      const { title, media, caption } = selection;
      return {
        title,
        media,
        subtitle: caption || 'No caption',
      };
    },
  },
});

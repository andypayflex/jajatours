import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonial',
  type: 'document',
  title: 'Testimonial',
  fields: [
    defineField({
      name: 'customerName',
      type: 'string',
      title: 'Customer Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customerPhoto',
      type: 'image',
      title: 'Customer Photo',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'quote',
      type: 'text',
      title: 'Quote',
      rows: 4,
      validation: (Rule) =>
        Rule.required().max(500).warning('Keep testimonials under 500 characters for readability'),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      title: 'Rating',
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
      options: {
        list: [
          { title: '1 Star', value: 1 },
          { title: '2 Stars', value: 2 },
          { title: '3 Stars', value: 3 },
          { title: '4 Stars', value: 4 },
          { title: '5 Stars', value: 5 },
        ],
      },
    }),
    defineField({
      name: 'tour',
      type: 'reference',
      title: 'Tour',
      description: 'Which tour is this testimonial about?',
      to: [{ type: 'tour' }],
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
      title: 'customerName',
      media: 'customerPhoto',
      quote: 'quote',
    },
    prepare(selection) {
      const { title, media, quote } = selection;
      return {
        title,
        media,
        subtitle: quote ? quote.substring(0, 60) + '...' : 'No quote',
      };
    },
  },
});

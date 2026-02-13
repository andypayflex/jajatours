import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'tour',
  type: 'document',
  title: 'Tour',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required().error('Please add a tour title'),
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
      description: 'Short description for tour listings and SEO',
      rows: 3,
      validation: (Rule) =>
        Rule.max(200).warning('For best SEO results, keep excerpts under 200 characters'),
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
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      description: 'Tour category',
      options: {
        list: [
          { title: 'Overlanding', value: 'Overlanding' },
          { title: 'Diving', value: 'Diving' },
          { title: 'Rafting', value: 'Rafting' },
          { title: 'Camping', value: 'Camping' },
          { title: 'Adventure', value: 'Adventure' },
        ],
      },
    }),
    defineField({
      name: 'duration',
      type: 'string',
      title: 'Duration',
      description: 'e.g. "3 days / 2 nights"',
    }),
    defineField({
      name: 'groupSize',
      type: 'object',
      title: 'Group Size',
      fields: [
        {
          name: 'min',
          type: 'number',
          title: 'Minimum',
        },
        {
          name: 'max',
          type: 'number',
          title: 'Maximum',
        },
      ],
    }),
    defineField({
      name: 'pricing',
      type: 'object',
      title: 'Pricing',
      fields: [
        {
          name: 'amount',
          type: 'number',
          title: 'Amount',
          validation: (Rule) => Rule.required().min(0),
        },
        {
          name: 'currency',
          type: 'string',
          title: 'Currency',
          options: {
            list: [
              { title: 'South African Rand', value: 'ZAR' },
              { title: 'US Dollar', value: 'USD' },
              { title: 'Euro', value: 'EUR' },
            ],
          },
          initialValue: 'ZAR',
        },
        {
          name: 'perPerson',
          type: 'boolean',
          title: 'Per Person',
          initialValue: true,
        },
      ],
    }),
    defineField({
      name: 'availableDates',
      type: 'array',
      title: 'Available Dates',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'date',
              type: 'date',
              title: 'Date',
            },
            {
              name: 'spotsAvailable',
              type: 'number',
              title: 'Spots Available',
              validation: (Rule) => Rule.min(0),
            },
          ],
        },
      ],
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
      amount: 'pricing.amount',
      currency: 'pricing.currency',
    },
    prepare(selection) {
      const { title, media, amount, currency } = selection;
      return {
        title,
        media,
        subtitle: amount
          ? `${currency === 'ZAR' ? 'R' : currency}${amount}`
          : 'No price set',
      };
    },
  },
});

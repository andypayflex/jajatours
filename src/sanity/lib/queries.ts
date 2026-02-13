// Centralized GROQ query definitions for all content types

// ============================================================================
// TOUR QUERIES
// ============================================================================

export const allToursQuery = `*[_type == "tour" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  pricing,
  category,
  duration,
  publishedAt
}`;

export const tourBySlugQuery = `*[_type == "tour" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  body,
  category,
  duration,
  groupSize,
  pricing,
  availableDates,
  publishedAt
}`;

// ============================================================================
// BLOG POST QUERIES
// ============================================================================

export const allBlogPostsQuery = `*[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  publishedAt
}`;

export const blogPostBySlugQuery = `*[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  body,
  publishedAt
}`;

// ============================================================================
// GALLERY QUERIES
// ============================================================================

export const allGalleryImagesQuery = `*[_type == "galleryImage" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  image,
  alt,
  caption,
  tags,
  publishedAt,
  "tourTitle": tour->title
}`;

export const galleryImagesByTourQuery = `*[_type == "galleryImage" && tour._ref == $tourId && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  image,
  alt,
  caption,
  tags,
  publishedAt,
  "tourTitle": tour->title
}`;

// ============================================================================
// TESTIMONIAL QUERIES
// ============================================================================

export const allTestimonialsQuery = `*[_type == "testimonial" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  customerName,
  customerPhoto,
  quote,
  rating,
  publishedAt,
  "tourTitle": tour->title,
  "tourSlug": tour->slug.current
}`;

export const testimonialsByTourQuery = `*[_type == "testimonial" && tour._ref == $tourId && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  customerName,
  customerPhoto,
  quote,
  rating,
  publishedAt,
  "tourTitle": tour->title,
  "tourSlug": tour->slug.current
}`;

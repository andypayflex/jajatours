export interface Tour {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  category?: string;
  duration?: string;
  mainImage?: string;
  mainImageAlt?: string;
  pricing?: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  groupSize?: {
    min: number;
    max: number;
  };
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];
  safetyInfo?: SafetyInfo;
  availableDates?: AvailableDate[];
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description?: string;
  activities?: string[];
  meals?: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
  };
  accommodation?: string;
}

export interface SafetyInfo {
  difficultyLevel?: string;
  fitnessRequirements?: string;
  risks?: string[];
  equipmentProvided?: string[];
  whatToBring?: string[];
  guideCertifications?: string;
}

export interface AvailableDate {
  date: string;
  spotsAvailable: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  mainImage?: string;
  mainImageAlt?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImage {
  id: string;
  image: string;
  alt: string;
  caption?: string;
  tourId?: string;
  tourTitle?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  customerPhoto?: string;
  quote: string;
  rating: number;
  tourId?: string;
  tourTitle?: string;
  publishedAt?: string;
  createdAt?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  interest?: string;
  message?: string;
  createdAt?: string;
}

export interface InquirySubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tour?: string;
  groupSize?: string;
  dates?: string;
  message?: string;
  createdAt?: string;
}

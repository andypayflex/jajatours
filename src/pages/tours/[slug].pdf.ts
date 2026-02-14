import type { APIRoute } from 'astro';
import PDFDocument from 'pdfkit';
import { getTourBySlug } from '@db/queries/tours.js';

export const GET: APIRoute = async ({ params }) => {
  const tour = getTourBySlug(params.slug!);
  if (!tour) {
    return new Response('Tour not found', { status: 404 });
  }

  // Generate PDF
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Uint8Array[] = [];
  doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));

  // --- Header ---
  doc.fontSize(24).font('Helvetica-Bold').text(tour.title, { align: 'center' });
  doc.moveDown(0.5);

  // Meta line: category, duration, group size
  const metaParts: string[] = [];
  if (tour.category) metaParts.push(tour.category);
  if (tour.duration) metaParts.push(tour.duration);
  if (tour.groupSize) metaParts.push(`${tour.groupSize.min}-${tour.groupSize.max} people`);
  if (metaParts.length > 0) {
    doc.fontSize(11).font('Helvetica').fillColor('#555555').text(metaParts.join(' | '), { align: 'center' });
  }
  doc.moveDown(1);

  // Excerpt
  if (tour.excerpt) {
    doc.fontSize(12).font('Helvetica').fillColor('#1A1A1A').text(tour.excerpt);
    doc.moveDown(1);
  }

  // --- Pricing ---
  if (tour.pricing) {
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#2D5016').text('Pricing');
    doc.moveDown(0.3);
    const currencySymbol = tour.pricing.currency === 'ZAR' ? 'R' : tour.pricing.currency + ' ';
    const priceText = `${currencySymbol}${tour.pricing.amount}${tour.pricing.perPerson ? ' per person' : ''}`;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1A1A1A').text(priceText);
    doc.moveDown(0.5);
  }

  // Inclusions
  if (tour.inclusions && tour.inclusions.length > 0) {
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#2D5016').text("What's Included");
    doc.moveDown(0.2);
    tour.inclusions.forEach((item: string) => {
      doc.fontSize(11).font('Helvetica').fillColor('#1A1A1A').text(`  ✓  ${item}`);
    });
    doc.moveDown(0.5);
  }

  // Exclusions
  if (tour.exclusions && tour.exclusions.length > 0) {
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#2D5016').text("What's Not Included");
    doc.moveDown(0.2);
    tour.exclusions.forEach((item: string) => {
      doc.fontSize(11).font('Helvetica').fillColor('#1A1A1A').text(`  ✗  ${item}`);
    });
    doc.moveDown(0.5);
  }

  // --- Itinerary ---
  if (tour.itinerary && tour.itinerary.length > 0) {
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#2D5016').text('Day-by-Day Itinerary');
    doc.moveDown(0.5);

    tour.itinerary.forEach((day) => {
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#D4A843').text(`Day ${day.dayNumber}: ${day.title}`);
      doc.moveDown(0.2);

      if (day.description) {
        doc.fontSize(11).font('Helvetica').fillColor('#1A1A1A').text(day.description);
        doc.moveDown(0.2);
      }

      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((activity: string) => {
          doc.fontSize(11).font('Helvetica').text(`  •  ${activity}`);
        });
        doc.moveDown(0.2);
      }

      if (day.meals) {
        const meals: string[] = [];
        if (day.meals.breakfast) meals.push('Breakfast');
        if (day.meals.lunch) meals.push('Lunch');
        if (day.meals.dinner) meals.push('Dinner');
        if (meals.length > 0) {
          doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555').text(`Meals: ${meals.join(', ')}`);
        }
      }

      if (day.accommodation) {
        doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555').text(`Accommodation: ${day.accommodation}`);
      }

      doc.moveDown(0.5);
    });
  }

  // --- Safety ---
  if (tour.safetyInfo) {
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#2D5016').text('Safety & Requirements');
    doc.moveDown(0.3);

    if (tour.safetyInfo.difficultyLevel) {
      const labels: Record<string, string> = {
        easy: 'Easy - All fitness levels',
        moderate: 'Moderate - Regular exercise helpful',
        challenging: 'Challenging - Good fitness required',
        strenuous: 'Strenuous - Excellent fitness required',
      };
      doc.fontSize(12).font('Helvetica-Bold').text(`Difficulty: ${labels[tour.safetyInfo.difficultyLevel] || tour.safetyInfo.difficultyLevel}`);
      doc.moveDown(0.2);
    }

    if (tour.safetyInfo.fitnessRequirements) {
      doc.fontSize(11).font('Helvetica').fillColor('#1A1A1A').text(tour.safetyInfo.fitnessRequirements);
      doc.moveDown(0.3);
    }

    if (tour.safetyInfo.whatToBring && tour.safetyInfo.whatToBring.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('What to Bring');
      doc.moveDown(0.2);
      tour.safetyInfo.whatToBring.forEach((item: string) => {
        doc.fontSize(11).font('Helvetica').text(`  •  ${item}`);
      });
      doc.moveDown(0.3);
    }

    if (tour.safetyInfo.guideCertifications) {
      doc.fontSize(12).font('Helvetica-Bold').text('Guide Certifications');
      doc.moveDown(0.2);
      doc.fontSize(11).font('Helvetica').text(tour.safetyInfo.guideCertifications);
    }
  }

  // --- Footer ---
  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica').fillColor('#555555').text('JaJa Tours - South African Adventures', { align: 'center' });
  doc.text('www.jajatours.co.za', { align: 'center' });

  doc.end();

  // Collect PDF buffer
  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${params.slug}-itinerary.pdf"`,
    },
  });
};

// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Contact Form Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const { contactLimiter } = require('../middleware/security');
const { validate } = require('../middleware/validation');
const { contactSubmissionSchema } = require('../schemas/contact.schemas');
const { sendEmail } = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

// ── POST / — Submit Contact Form ─────────────────────────────

router.post(
  '/',
  contactLimiter,
  validate(contactSubmissionSchema),
  async (req, res, next) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        orgName,
        orgSize,
        services,
        budget,
        timeline,
        scope,
        notes,
      } = req.body;

      // Generate reference number
      const referenceNumber = `HS-CONTACT-${Date.now()}`;

      // Save to database
      const submission = await prisma.contactSubmission.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          orgName,
          orgSize,
          services,
          budget,
          timeline,
          scope,
          notes: notes || null,
          referenceNumber,
        },
      });

      // Send notification to admin
      const adminEmail = process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || 'admin@hexashield.in';
      sendEmail({
        to: adminEmail,
        subject: `New Contact Submission — ${referenceNumber}`,
        html: `
          <h2>New Contact Submission</h2>
          <p><strong>Reference:</strong> ${referenceNumber}</p>
          <hr>
          <h3>Contact Details</h3>
          <ul>
            <li><strong>Name:</strong> ${firstName} ${lastName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
          </ul>
          <h3>Organisation</h3>
          <ul>
            <li><strong>Name:</strong> ${orgName}</li>
            <li><strong>Size:</strong> ${orgSize}</li>
          </ul>
          <h3>Requirements</h3>
          <ul>
            <li><strong>Services:</strong> ${services.join(', ')}</li>
            <li><strong>Budget:</strong> ${budget}</li>
            <li><strong>Timeline:</strong> ${timeline}</li>
          </ul>
          <h3>Scope</h3>
          <p>${scope}</p>
          ${notes ? `<h3>Additional Notes</h3><p>${notes}</p>` : ''}
        `,
      }).catch(() => {
        // Email failures should not block form submission
      });

      // Send confirmation to submitter
      sendEmail({
        to: email,
        subject: `HexaShield — We Received Your Request (${referenceNumber})`,
        html: `
          <h2>Thank you for contacting HexaShield Security</h2>
          <p>Dear ${firstName},</p>
          <p>We have received your inquiry and will get back to you within 24 hours.</p>
          <p>Your reference number: <strong>${referenceNumber}</strong></p>
          <p>Please keep this reference number for future correspondence.</p>
          <hr>
          <p>HexaShield Security — Securing Your Digital Assets</p>
        `,
      }).catch(() => {
        // Email failures should not block form submission
      });

      return res.status(201).json({
        status: 'ok',
        data: {
          referenceNumber: submission.referenceNumber,
          message: 'Your request has been submitted successfully. We will contact you within 24 hours.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

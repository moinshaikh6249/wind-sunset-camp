export default function TermsOfServicePage() {
  return (
    <section className="max-w-[800px] mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-10">Terms of Service</h1>

      <div className="space-y-10 text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Introduction</h2>
          <p>
            These Terms of Service govern access to and use of our platform. By using the website,
            you agree to comply with these terms and all applicable laws and regulations.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">User Responsibilities</h2>
          <p>
            Users are responsible for providing accurate information, maintaining account security,
            and using the platform in a lawful, respectful, and non-disruptive manner.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Booking Policy</h2>
          <p>
            All bookings are subject to availability and confirmation. Submitted booking details must
            be accurate, and users should review confirmation information carefully.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Cancellation Policy</h2>
          <p>
            Cancellation and rescheduling requests are handled according to the active cancellation
            rules at the time of booking and may vary by camp schedule or operational requirements.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Payments</h2>
          <p>
            Payment terms, due dates, and accepted methods are communicated during booking. Users
            are responsible for ensuring timely and valid payment completion.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Liability Disclaimer</h2>
          <p>
            Services are provided on an as-available basis. While we strive for reliability and
            safety, we do not guarantee uninterrupted availability and disclaim liability to the
            fullest extent permitted by applicable law.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the website after updates
            become effective constitutes acceptance of the revised terms.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function CancellationPolicyPage() {
  return (
    <section className="max-w-[800px] mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-10">Cancellation Policy</h1>

      <div className="space-y-10 text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Cancellation Time Limits</h2>
          <p>
            Cancellations must be submitted within the allowed time window mentioned at booking to
            qualify for standard policy handling.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Partial Refunds</h2>
          <p>
            Depending on how close the cancellation is to the camp date, partial refunds may apply
            according to active booking terms.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">No-show Policy</h2>
          <p>
            If a participant does not attend without prior notice, the booking may be treated as a
            no-show and be ineligible for refund.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Camp Organizer Cancellation</h2>
          <p>
            If a camp is cancelled by the organizer for operational reasons, affected participants are
            offered policy-compliant refunds or rebooking options.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Emergency Situations</h2>
          <p>
            In verified emergencies, special review may be provided on a case-by-case basis with
            relevant supporting information.
          </p>
        </div>
      </div>
    </section>
  );
}

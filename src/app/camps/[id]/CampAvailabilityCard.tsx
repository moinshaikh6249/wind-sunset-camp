"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { AvailabilityIndicator, AvailabilityStatus } from "@/components/booking/AvailabilityIndicator";

interface CampAvailabilityCardProps {
  campId: string;
}

export default function CampAvailabilityCard({ campId }: CampAvailabilityCardProps) {
  const [status, setStatus] = useState<AvailabilityStatus>("loading");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [capacity, setCapacity] = useState<number | null>(null);

  const loadAvailability = React.useCallback(async () => {
    try {
      setStatus("loading");
      const res = await api.get(`/camps/${campId}/availability`);
      const data = res?.data || res;
      if (data?.success) {
        setStatus(data.status as AvailabilityStatus);
        setRemaining(typeof data.remaining === "number" ? data.remaining : null);
        setCapacity(typeof data.capacity === "number" ? data.capacity : null);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [campId]);

  useEffect(() => {
    if (campId) {
      void loadAvailability();
    }
  }, [campId, loadAvailability]);

  return (
    <div className="my-3">
      <AvailabilityIndicator
        status={status}
        remaining={remaining}
        capacity={capacity}
        onRetry={loadAvailability}
      />
    </div>
  );
}

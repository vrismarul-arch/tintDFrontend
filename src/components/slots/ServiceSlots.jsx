import { useEffect, useState } from "react";
import { Card, Button, Spin } from "antd";

export default function ServiceSlots({ serviceId }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${serviceId}/slots`);
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [serviceId]);

  if (loading) return <Spin />;

  return (
    <Card title="Available Slots" className="mt-4">
      {slots.length === 0 ? (
        <p>No slots available</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot, i) => (
            <Button key={i}>{slot}</Button>
          ))}
        </div>
      )}
    </Card>
  );
}

import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { CheckCircleOutlined } from "@ant-design/icons";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 p-4">
      <Card className="w-full max-w-lg text-center shadow-md">
        <CheckCircleOutlined style={{ fontSize: "64px", color: "green" }} />
        <h2 className="text-2xl font-bold mt-4">🎉 Booking Confirmed!</h2>
        <p className="mt-2 text-gray-600">
          Thank you for your booking. Your payment has been verified successfully.
        </p>

        <Button
          type="primary"
          size="large"
          className="mt-6"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
        <Button
          className="mt-2"
          onClick={() => navigate("/profile")}
        >
          View My Bookings
        </Button>
      </Card>
    </div>
  );
}

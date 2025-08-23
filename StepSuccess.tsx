import { useNavigate } from "react-router-dom";
import { useState, useEffect, memo } from "react";
import SplitText from "../../../../../components/SplitText";

// Composant mémorisé pour éviter le re-render
const ThankYouTitle = memo(() => (
  <SplitText
    text="Thank you!"
    className="text-4xl text-blue-600 font-semibold text-center mb-4"
    delay={100}
    duration={1.5}
    ease="power3.out"
    splitType="chars"
    from={{ opacity: 0, y: 40 }}
    to={{ opacity: 1, y: 0 }}
    threshold={0.1}
    rootMargin="-100px"
    textAlign="center"
  />
));

ThankYouTitle.displayName = 'ThankYouTitle';

export default function NewFlatSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <ThankYouTitle />
      <p className="text-gray-700 text-lg mb-8">
        Your property has been successfully submitted.
      </p>
      <p className="text-gray-500 text-base">
        Redirecting to homepage in {countdown} second{countdown !== 1 ? 's' : ''}...
      </p>
    </div>
  );
}
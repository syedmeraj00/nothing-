import React, { useEffect, useState } from "react";

const fullMessage = "Disclaimer: All reports reflect only the data entered; accuracy and reliability depend on your inputs.";

const FooterDisclaimer = () => {
  const [visibleText, setVisibleText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < fullMessage.length) {
        setVisibleText((prev) => prev + fullMessage.charAt(index));
        setIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 30); // Animation speed

    return () => clearInterval(interval);
  }, [index]);

  return (
    <footer className="bg-[#1b3a2d] text-white text-center py-3 mt-10 text-sm shadow-inner">
      {
        // Render with bolded "Disclaimer" word
        <span className="tracking-wide font-medium">
          {visibleText.startsWith("Disclaimer:") ? (
            <>
              <strong>Disclaimer:</strong>
              {visibleText.slice("Disclaimer:".length)}
            </>
          ) : (
            visibleText
          )}
        </span>
      }
    </footer>
  );
};

export default FooterDisclaimer;

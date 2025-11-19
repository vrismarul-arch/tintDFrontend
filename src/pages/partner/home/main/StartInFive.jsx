import React from "react";
import "./StartInFive.css";
import left from "./5.png";

const StartInFive = () => {
  return (
    <section className="start-five">

      {/* LEFT SIDE IMAGE */}
      <div className="left-block-img">
        <img src={left} alt="Steps Illustration" />
      </div>

      {/* RIGHT SIDE TIMELINE */}
      <div className="right-block">
        <ul>
          <li>Fill the Partner Form</li>
          <li>Pay Refundable Deposit</li>
          <li>Attend Training</li>
          <li>Receive Partner Kit & Tools</li>
          <li>Start Taking Clients & Earn</li>
        </ul>
      </div>

    </section>
  );
};

export default StartInFive;

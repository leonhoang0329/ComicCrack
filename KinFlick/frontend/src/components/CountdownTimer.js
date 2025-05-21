import React from 'react';
import { useCountdownTimer } from '../utils/countdownTimer';
import './CountdownTimer.css';

const CountdownTimer = () => {
  const { hours, minutes, seconds } = useCountdownTimer();

  return (
    <div className="countdown-container">
      <h2>Time left today:</h2>
      <div className="countdown-timer">
        <div className="countdown-segment">
          <span className="countdown-value">{hours.toString().padStart(2, '0')}</span>
          <span className="countdown-label">Hours</span>
        </div>
        <div className="countdown-divider">:</div>
        <div className="countdown-segment">
          <span className="countdown-value">{minutes.toString().padStart(2, '0')}</span>
          <span className="countdown-label">Minutes</span>
        </div>
        <div className="countdown-divider">:</div>
        <div className="countdown-segment">
          <span className="countdown-value">{seconds.toString().padStart(2, '0')}</span>
          <span className="countdown-label">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;

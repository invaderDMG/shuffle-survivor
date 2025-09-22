import './LoadingScreen.css';

interface LoadingScreenProps {
  message: string;
  progress: number; // 0-100
  subMessage?: string;
}

export default function LoadingScreen({ message, progress, subMessage }: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1>🎵 Shuffle Survivor</h1>
        
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        
        <div className="loading-message">
          <h2>{message}</h2>
          {subMessage && <p>{subMessage}</p>}
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

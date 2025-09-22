import './AppScreen.css';

interface AppScreenProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppScreen({ children, className = '' }: AppScreenProps) {
  return (
    <div className={`app-screen ${className}`}>
      <div className="app-screen-content">
        {children}
      </div>
    </div>
  );
}

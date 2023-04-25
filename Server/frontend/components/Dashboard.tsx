import { ReactNode } from 'react';
import styles from '../styles/Dashboard.module.css';


// Dashboard component
interface DashboardProps {
  children: ReactNode;
}
const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  return (
    <main className={styles.page_container}>
      {/* Add your dashboard content here */}
      {children}
    </main>
  );
};


// Box component
interface BoxProps {
  children: ReactNode;
  title: string;
}
const Box: React.FC<BoxProps> = ({ title, children}) => {
  return (
    <div className={styles.box_container}>
      <h2 className={styles.box_title}>{title}</h2>
      <p>
        {/* Add your box content here */}
        {children}
      </p>
    </div>
  );
};

// Button component
interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}
const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button className={styles.btn_grad} onClick={onClick}>
      {children}
    </button>
  );
};


export {Dashboard, Box, Button};

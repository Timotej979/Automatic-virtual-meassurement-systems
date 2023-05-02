import { ReactNode } from 'react';
import Chart from 'chart.js/auto';
import Slider from '@mui/material/Slider';
import { jsx } from '@emotion/react';
import styles from '../styles/Dashboard.module.css';


// Dashboard component
interface DashboardProps {
  children: ReactNode;
}
const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  return (
    <main className={styles.page_container}>
      <div className={styles.container}>
        {/* Add your dashboard content here */}
        {children}
      </div>
    </main>
  );
};

// First part component
interface FirstPartProps {
  children: React.ReactNode;
}
const FirstPart: React.FC<FirstPartProps> = ({ children }) => {
  return (
    <div className={`${styles.first_part} ${styles.container}`}>
      {children}
    </div>
  );
};

// Second part component
interface SecondPartProps {
  children: React.ReactNode;
}
const SecondPart: React.FC<SecondPartProps> = ({ children }) => {
  return (
    <div className={`${styles.second_part} ${styles.container}`}>
      {children}
    </div>
  );
};


// Third part component
interface ThirdPartProps {
  children: React.ReactNode;
}
const ThirdPart: React.FC<ThirdPartProps> = ({ children }) => {
  return (
    <div className={`${styles.third_part} ${styles.container}`}>
      {children}
    </div>
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
      <div>
        {/* Add your box content here */}
        {children}
      </div>
    </div>
  );
};

// Button components
interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}
const ButtonSensor: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button className={styles.btn_sensor_grad} onClick={onClick}>
      {children}
    </button>
  );
};
const ButtonAuto: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button className={styles.btn_auto_grad} onClick={onClick}>
      {children}
    </button>
  );
};
const ButtonWater: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button className={styles.btn_water_grad} onClick={onClick}>
      {children}
    </button>
  );
};

// Slider component
interface ThresholdSliderProps {
  value: number;
  onChange: (event: Event, value: number | number[]) => void;
}
const ThresholdSlider: React.FC<ThresholdSliderProps> = ({ value, onChange }) => {
  return (
    <div className={styles.slider_container}>
      <Slider
        value={value}
        onChange={onChange}
        aria-label="Soil moisture threshold"
        valueLabelDisplay="auto"
        min={0}
        max={100}
      />
    </div>
  );
};


export {Dashboard, FirstPart, SecondPart, ThirdPart, Box, ButtonSensor, ButtonAuto, ButtonWater, ThresholdSlider};

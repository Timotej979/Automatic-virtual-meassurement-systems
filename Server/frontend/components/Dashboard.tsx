import { ReactNode } from 'react';
import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Box component
interface BoxProps {
  children: ReactNode;
  title: string;
}
const BoundaryBox: React.FC<BoxProps> = ({ title, children}) => {
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Slider threshold component
function valuetextThreshold(value: number) {
  return `${value}%`;
}
function ThresholdDiscreteSlider() {
  return (
    <Box sx={{ width: 300, display: 'flex', justifyContent: 'center' }}>
      <Slider sx={{ color: "#32cd32"}}
        aria-label="Soil moisture threshold"
        defaultValue={30}
        getAriaValueText={valuetextThreshold}
        valueLabelDisplay="auto"
        step={5}
        marks
        min={0}
        max={100}
        title="Soil moisture threshold"
      />
    </Box>
  );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Slider watering component
function valuetextWatering(value: number) {
  return `${value}s`;
}
function WateringDiscreteSlider() {
  return (
    <Box sx={{ width: 300, display: 'flex', justifyContent: 'center' }}>
      <Slider sx={{ color: "#87ceeb" }}
        aria-label="Watering time"
        defaultValue={30}
        getAriaValueText={valuetextWatering}
        valueLabelDisplay="auto"
        step={2}
        marks
        min={2}
        max={40}
        title="Watering time"
      />
    </Box>
  );
}
// Export components
export {Dashboard, FirstPart, SecondPart, ThirdPart, BoundaryBox, ButtonSensor, ButtonAuto, ButtonWater, ThresholdDiscreteSlider, WateringDiscreteSlider};
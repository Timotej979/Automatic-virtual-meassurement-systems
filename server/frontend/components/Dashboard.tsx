import { ReactNode } from 'react';
import * as React from 'react';
import PropTypes from 'prop-types';
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
      <div style={{ height: '100%' }}>
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Graph Label positioning component
type AxisLabelProps = {
  axisType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  children: React.ReactNode;
}
const AxisLabel = ({ axisType, x, y, width, height, fill, children }: AxisLabelProps) => {
  // Calculate position of label
  const isVert = axisType === 'yAxis';
  const cx = isVert ? x : x + (width / 2);
  const cy = isVert ? (height / 2) + y : y + height + 10;
  const rot = isVert ? `270 ${cx} ${cy}` : 0;

  // Split label in two lines if possible
  const words = (children || '').toString().split('\n');
  // Remove commas from words if there are any
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].replace(",", "");
  }
  // Return label
  return (
    <text x={cx} y={cy} transform={`rotate(${rot})`} textAnchor="middle" fill={fill} fontSize={18}>
      {words.map((word, i) => <tspan key={i} x={cx} y={cy + (i * 20)}>{word}</tspan>)}
    </text>
  );
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Export components
export {Dashboard, FirstPart, SecondPart, ThirdPart, BoundaryBox, ButtonSensor, ButtonAuto, ButtonWater, ThresholdDiscreteSlider, WateringDiscreteSlider, AxisLabel};
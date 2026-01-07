import React from "react";

const RupeeIcon = ({
  className = "inline-block h-4 w-4 align-middle",
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    preserveAspectRatio="xMidYMid meet"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="22"
      fontWeight="600"
      fill="currentColor"
      fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
    >
      {"\u20B9"}
    </text>
  </svg>
);

export default RupeeIcon;

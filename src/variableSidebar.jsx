// VariableSidebar.js
import React from 'react';

const VariableSidebar = ({ variables, variableCounts, variableValues, onVariableValueChange }) => {
  return (
    <div className="sidebar m-3">
      <h3>Variables</h3>
      <ul>
        {variables.map((variable) => (
          <li key={variable}>
            {variable}: {variableCounts[variable] || 0}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VariableSidebar;

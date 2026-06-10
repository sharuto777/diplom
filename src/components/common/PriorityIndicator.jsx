import React from "react";
import {
  normalizePriority,
  getPriorityLabel,
  getPrioritySymbols,
} from "../../utils/taskFormatters";

function PriorityIndicator({ priority }) {
  const normalizedPriority = normalizePriority(priority);

  return (
    <span
      className={`priority-indicator ${normalizedPriority}`}
      data-tooltip={getPriorityLabel(priority)}
    >
      {getPrioritySymbols(priority)}
    </span>
  );
}

export default PriorityIndicator;
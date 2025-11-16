"use client";

import { useState } from "react";

interface ExpandableDescriptionProps {
  description: string;
  wordLimit?: number;
}

// Function to clean description (remove URLs, normalize whitespace)
const cleanDescription = (desc: string) => {
  if (!desc) return '';
  
  // Clean up description (remove URLs, normalize whitespace)
  const cleanDesc = desc
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/\|/g, '') // Remove | character
    .replace(/\n/g, ' ') // Replace line breaks with spaces
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  return cleanDesc;
};

const ExpandableDescription = ({ 
  description, 
  wordLimit = 45 
}: ExpandableDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return (
      <p className="text-gray-300 text-sm sm:text-base md:text-lg hyphens-auto break-words">
        Loading description...
      </p>
    );
  }

  const cleanedDesc = cleanDescription(description);
  const words = cleanedDesc.split(' ');
  const needsTruncation = words.length > wordLimit;
  const truncatedText = needsTruncation 
    ? words.slice(0, wordLimit).join(' ') 
    : cleanedDesc;
  const fullText = cleanedDesc;

  const displayText = isExpanded ? fullText : truncatedText;

  return (
    <div className="hyphens-auto break-words">
      <p className="text-gray-300 text-sm sm:text-base md:text-lg">
        {displayText}
        {!isExpanded && needsTruncation && "..."}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-fuchsia-400 hover:text-fuchsia-300 font-semibold text-sm sm:text-base transition-colors duration-200 underline"
        >
          {isExpanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
};

export default ExpandableDescription;


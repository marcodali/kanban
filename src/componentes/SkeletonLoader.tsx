import React from "react";

const SkeletonLoader: React.FC = () => {
  return (
    <div className="flex space-x-4 p-8">
      {[1, 2, 3].map((_, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg p-4 w-72 h-auto animate-pulse flex flex-col space-y-4"
        >
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="bg-gray-700 h-12 rounded mb-2"
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

import React from 'react';
import Icons from '../../assets/icons';

const LoadingEffect = ({ overlay = false, message, size = "medium", theme = "light" }) => {
  return (
    <div className={`${overlay ? "fixed inset-0 bg-white z-[9999]" : "h-full min-h-[400px] w-full"} flex flex-col items-center justify-center p-4`}>
      <div className={`flex flex-col items-center gap-2 animate-in fade-in duration-300`}>
        <div className="w-12 animate-[car-idle_0.3s_ease-in-out_infinite] text-(--main-color)">
          <Icons.Truck size={35} />
        </div>

        <div className="flex justify-between w-12">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-(--main-color) rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
      {message && (
        <p className={`mt-4 font-medium text-sm text-center animate-pulse ${theme === "dark" ? "text-white" : "text-(--dark-grey)"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingEffect;
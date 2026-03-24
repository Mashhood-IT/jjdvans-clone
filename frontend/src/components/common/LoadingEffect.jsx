import React from 'react';
import Icons from '../../assets/icons';

const LoadingEffect = ({ overlay = false }) => {
  return (
    <div className={`${overlay ? "fixed inset-0 bg-white z-[9999]" : "h-screen"} flex flex-col items-center justify-center gap-2`}>
      <div className="w-12 animate-[car-idle_0.3s_ease-in-out_infinite] text-(--main-color)">
        <Icons.Truck size={35} />
      </div>

      <div className="flex justify-between w-14">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-(--main-color) rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingEffect;
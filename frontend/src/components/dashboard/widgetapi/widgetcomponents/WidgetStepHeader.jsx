import React from 'react';

const WidgetStepHeader = ({ title, step, description }) => {
    return (
        <div className="mb-8 mt-2 px-4 md:px-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium tracking-wide uppercase">
                <span className="bg-gray-900 text-white px-2 py-0.5 rounded text-[10px]">STEP {step}</span>
                <span className="text-gray-400">/</span>
                <span>04</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {title}
            </h1>
            <p className="text-gray-600 max-w-2xl">
                {description}
            </p>
        </div>
    );
};

export default WidgetStepHeader;

import React from 'react';

const WidgetStepHeader = ({ title, step, description }) => {
    return (
        <div className="mb-8 mt-2 px-4 md:px-0">
            <div className="flex items-center gap-2 bg-(--mate-color) !text-white px-2 py-0.5 rounded !text-[10px] w-fit mb-2">
                <span className="">STEP {step}</span>
                <span className="text-gray-400">/</span>
                <span>04</span>
            </div>
            <h1 className="widget-page-title mb-2">
                {title}
            </h1>
            <p className="widget-description max-w-2xl">
                {description}
            </p>
        </div>
    );
};

export default WidgetStepHeader;
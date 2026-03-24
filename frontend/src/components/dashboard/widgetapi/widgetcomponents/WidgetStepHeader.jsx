import React from 'react';

const WidgetStepHeader = ({ title, description }) => {
    return (
        <div className="mb-8 mt-2">
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
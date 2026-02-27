import React from "react";

const OutletHeading = ({ name }) => {
  return (
    <>
      <h2 className="text-lg md:text-2xl font-bold text-(--dark-gray) mb-2">
        {name}
      </h2>
      <hr className="mb-6 border-(--light-gray)" />
    </>
  );
};

export default OutletHeading;
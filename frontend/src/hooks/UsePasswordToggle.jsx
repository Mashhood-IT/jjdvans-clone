import { useState } from "react";

const UsePasswordToggle = () => {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible((prev) => !prev);

  return {
    type: visible ? "text" : "password",
    visible,
    toggleVisibility,
  };
};

export default UsePasswordToggle;

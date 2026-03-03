import React from "react";
import StatCards from "./StatCards";
import { useSelector } from "react-redux";
import LoadingEffect from "../../common/LoadingEffect";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <LoadingEffect />;
  }

  return (
    <>
      <OutletHeading
        name="Stats"
      />
      <div className="space-y-6 max-w-full">
        <StatCards />
      </div>
    </>
  );
};

export default Dashboard;
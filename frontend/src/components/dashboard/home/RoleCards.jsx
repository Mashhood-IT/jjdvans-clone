import React from "react";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";

const nf = new Intl.NumberFormat();

const RoleCards = () => {
  const user = useSelector((state) => state?.auth?.user);

  const cardData = [
    { title: "Total Bookings", value: 10, icon: "FileText" },
    {
      title: "Total Customers",
      value: 10,

      icon: "Users",
    },
  ];

  const roleVisibility = {
    superadmin: [
      "Total Bookings",
      "Total Customers",
    ]
  };

  const visibleCards = cardData.filter((card) =>
    roleVisibility[user?.role?.toLowerCase()]?.includes(card.title)
  );

  return (
    <section className="w-full">
      <div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {visibleCards.map((card, index) =>
            card.skeleton ? (
              <div
                key={`s-${index}`}
                className="h-24 sm:h-32 animate-pulse rounded-xl sm:rounded-2xl bg-[#07384d]"
              />
            ) : (
              <article
                key={index}
                className="relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 bg-[#07384d] text-white shadow-md sm:shadow-lg focus-within:ring-2 focus-within:ring-theme/40"
                role="region"
                aria-label={card.title}
                tabIndex={0}
              >
                <div className="pointer-events-none absolute inset-0 bg-(--white)/10 mix-blend-overlay" />
                <div className="absolute right-2 sm:right-3 top-2 sm:top-3 flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-(--white)/20 shadow-md">
                  {Icons[card.icon] && React.createElement(Icons[card.icon], { className: "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" })}
                </div>
                <p className="relative z-10 line-clamp-2 pr-12 sm:pr-14 text-sm sm:text-base font-semibold tracking-wide">
                  {card.title}
                </p>
                <p className="relative z-10 mt-1.5 sm:mt-2 md:mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-none">
                  {nf.format(card.value)}
                </p>
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
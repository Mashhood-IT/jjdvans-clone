import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CarCardSection from './widgetcomponents/CarCardSection';
import JourneySummaryCard from './widgetcomponents/JourneySummaryCard';
import WidgetStepHeader from './widgetcomponents/WidgetStepHeader';

import { toast } from 'react-toastify';
import IMAGES from '../../../assets/images';
import { useLazyGeocodeQuery, useLazyGetDistanceQuery } from '../../../redux/api/googleApi';

import { useGetAllVehiclesQuery } from '../../../redux/api/vehicleApi';
import { useGetPublicBookingSettingQuery } from '../../../redux/api/bookingSettingsApi';
import { useLoading } from '../../common/LoadingProvider';
import useDistanceSync from '../../../hooks/useDistanceSync';

const WidgetBookingInformation = ({
  onNext,
  dropOffPrice,
}) => {
  const companyId = new URLSearchParams(window.location.search).get("company") || "";
  const { data: bookingSettingData } = useGetPublicBookingSettingQuery(companyId, {
    skip: !companyId
  });
  const { showLoading, hideLoading } = useLoading()

  const { data: vehicleResponse, isLoading: isVehiclesLoading } = useGetAllVehiclesQuery();
  const [triggerGeocode] = useLazyGeocodeQuery();
  const [triggerDistance] = useLazyGetDistanceQuery();

  const carList = vehicleResponse?.data || vehicleResponse || [];

  const [formData, setFormData] = useState(null);
  const {
    distanceText,
    durationText,
    miles: actualMiles,
    googleMinutes,
    roundedGoogleMinutes,
    segments: segmentBreakdown,
    calculateRoute,
    loading: isDistanceLoading
  } = useDistanceSync(companyId);

  const [selectedCarId, setSelectedCarId] = useState(null);
  const [matchedSurcharge, setMatchedSurcharge] = useState(0);
  const [matchedZonePrice, setMatchedZonePrice] = useState(null);
  const [matchedZoneToZonePrice, setMatchedZoneToZonePrice] = useState(null);
  const [fixedZonePrice, setFixedZonePrice] = useState(null);
  const [journeyDateTime, setJourneyDateTime] = useState(null);
  const [matchedDiscount, setMatchedDiscount] = useState(0);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);
  const [extraHelpPrice, setExtraHelpPrice] = useState(0);
  const [selectedHelpOption, setSelectedHelpOption] = useState(null);
  const postcodePrices = [];
  const zones = [];
  const generalPricing = {
    pickupAirportPrice: 10,
    dropoffAirportPrice: 10,
    minAdditionalDropOff: 5
  };

  useEffect(() => {
    if (isVehiclesLoading || isDistanceLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [showLoading, hideLoading, isVehiclesLoading, isDistanceLoading])

  const fixedPrices = [];
  const discounts = [];

  const currencySetting = bookingSettingData?.setting?.currency?.[0] || null;
  const currencySymbol = currencySetting?.symbol || '£';
  const currencyCode = currencySetting?.value || 'GBP';

  const getVehiclePriceForDistance = useCallback((vehicle, miles) => {
    if (!vehicle?.slabs || !Array.isArray(vehicle.slabs) || vehicle.slabs.length === 0) return 0;
    if (miles <= 0) return 0;

    let total = 0;
    const slabs = [...vehicle.slabs].sort((a, b) => a.from - b.from);
    const lastSlab = slabs[slabs.length - 1];

    for (const slab of slabs) {
      if (miles <= slab.from) break;

      const slabStart = slab.from;
      const slabEnd = slab.to;
      const slabPrice = parseFloat(slab.price || 0);

      if (miles >= slabEnd) {
        total += slabPrice;
      } else {
        const slabDistance = slabEnd - slabStart;
        if (slabDistance > 0) {
          const pricePerMile = slabPrice / slabDistance;
          const coveredInSlab = miles - slabStart;
          total += coveredInSlab * pricePerMile;
        }
        break;
      }
    }

    if (miles > lastSlab.to) {
      const excessDistance = miles - lastSlab.to;
      const slabDistance = lastSlab.to - lastSlab.from;
      if (slabDistance > 0) {
        const lastSlabRate = parseFloat(lastSlab.price || 0) / slabDistance;
        total += excessDistance * lastSlabRate;
      }
    }

    return parseFloat(total.toFixed(2));
  }, []);

  const calculatePrimaryAirportFees = () => {
    if (!formData) return 0;

    const normalize = (t) =>
      t?.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim() || "";

    let total = 0;

    const addresses = [
      formData.pickup,
      formData.dropoff,
      formData.additionalDropoff1,
      formData.additionalDropoff2,
      formData.additionalDropoff3,
      formData.additionalDropoff4,
    ].filter(Boolean);

    addresses.forEach((addr) => {
      const clean = normalize(addr);

      if (clean.includes("airport")) {
        if (addr === formData.pickup) {
          total += generalPricing?.pickupAirportPrice || 0;
        }
        else {
          total += generalPricing?.dropoffAirportPrice || 0;
        }
      }
    });

    return total;
  };

  const extractPostcode = (address) => {
    const match = address?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
    return match ? match[0].toUpperCase() : null;
  };

  const [pickupPostcode, setPickupPostcode] = useState(null);
  const [dropoffPostcode, setDropoffPostcode] = useState(null);
  const [matchedPostcodePrice, setMatchedPostcodePrice] = useState(null);

  useEffect(() => {
    const isEdit = new URLSearchParams(window.location.search).get("isEdit") === "true";

    if (isEdit) return;
    const savedData = localStorage.getItem("bookingForm");
    const parsed = JSON.parse(savedData);
    setFormData((prev) => ({
      ...prev, ...parsed
    }));
  }, []);

  useEffect(() => {
    const isEdit = new URLSearchParams(window.location.search).get("isEdit") === "true";
    if (isEdit) {
      const timer = setTimeout(() => {
        try {
          const savedVehicle = localStorage.getItem("selectedVehicle");
          if (!savedVehicle) return;

          const parsed = JSON.parse(savedVehicle);

          if (parsed.id) {
            setSelectedCarId(parsed.id);
            return;
          }

          if (parsed.vehicleName && Array.isArray(carList) && carList.length > 0) {
            const match = carList.find(
              (c) => c.vehicleName && c.vehicleName === parsed.vehicleName
            );
            if (match) {
              setSelectedCarId(match._id);
              localStorage.setItem(
                "selectedVehicle",
                JSON.stringify({
                  ...parsed,
                  id: match._id,
                  vehicleName: match.vehicleName || parsed.vehicleName,
                  image: match.image || parsed.image || IMAGES.profilecarimg,
                  passengerSeats: match.passengerSeats || parsed.passengerSeats || 0,
                  maxSeats: match.passengerSeats || parsed.passengerSeats || 0,
                  halfHourPrice: match.halfHourPrice || parsed.halfHourPrice || 0,
                })
              );
            }
          }
        } catch (err) {
          console.error("Error restoring selectedVehicle from localStorage:", err);
        }
      }, 150);
      return () => clearTimeout(timer);
    }

    try {
      const savedVehicle = localStorage.getItem("selectedVehicle");
      if (!savedVehicle) return;

      const parsed = JSON.parse(savedVehicle);

      if (parsed.id) {
        setSelectedCarId(parsed.id);
        return;
      }

      if (parsed.vehicleName && Array.isArray(carList) && carList.length > 0) {
        const match = carList.find(
          (c) => c.vehicleName && c.vehicleName === parsed.vehicleName
        );
        if (match) {
          setSelectedCarId(match._id);
          localStorage.setItem(
            "selectedVehicle",
            JSON.stringify({
              ...parsed,
              id: match._id,
              vehicleName: match.vehicleName || parsed.vehicleName,
              image: match.image || parsed.image || IMAGES.profilecarimg,
              passengerSeats: match.passengerSeats || parsed.passengerSeats || 0,
              maxSeats: match.passengerSeats || parsed.passengerSeats || 0,
              halfHourPrice: match.halfHourPrice || parsed.halfHourPrice || 0,
            })
          );
        }
      }
    } catch (err) {
      console.error("Error restoring selectedVehicle from localStorage:", err);
    }
  }, [carList]);

  useEffect(() => {
    const isEdit = new URLSearchParams(window.location.search).get("isEdit") === "true";

    if (isEdit) {
      const timer = setTimeout(() => {
        try {
          const rawPricing = localStorage.getItem("widgetPricing");
          if (!rawPricing) return;

          const parsed = JSON.parse(rawPricing);
          if (parsed.extraHelp && typeof parsed.extraHelp.price === "number") {
            setExtraHelpPrice(parsed.extraHelp.price);
            setSelectedHelpOption({
              label: parsed.extraHelp.label || parsed.extraHelp.label === "" ? parsed.extraHelp.label : "Self Load",
              price: parsed.extraHelp.price,
            });
          }
        } catch (err) {
          console.error("Error restoring widgetPricing from localStorage:", err);
        }
      }, 150);
      return () => clearTimeout(timer);
    }

    try {
      const rawPricing = localStorage.getItem("widgetPricing");
      if (!rawPricing) return;

      const parsed = JSON.parse(rawPricing);
      if (parsed.extraHelp && typeof parsed.extraHelp.price === "number") {
        setExtraHelpPrice(parsed.extraHelp.price);
        setSelectedHelpOption({
          label: parsed.extraHelp.label || parsed.extraHelp.label === "" ? parsed.extraHelp.label : "Self Load",
          price: parsed.extraHelp.price,
        });
      }
    } catch (err) {
      console.error("Error restoring widgetPricing from localStorage:", err);
    }
  }, []);

  const matchFixedPrice = () => {
    try {
      if (!Array.isArray(fixedPrices) || fixedPrices.length === 0) return null;
      if (!formData?.pickup || !formData?.dropoff) return null;

      const pickupName = formData.pickup.toLowerCase();
      const dropoffName = formData.dropoff.toLowerCase();

      const normalize = (text) =>
        text
          ?.toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

      const normalizedPickup = normalize(pickupName);
      const normalizedDropoff = normalize(dropoffName);

      const matchedZone = fixedPrices.find((zone) => {
        const from = normalize(zone.pickup);
        const to = normalize(zone.dropoff);

        return (
          (normalizedPickup.includes(from) && normalizedDropoff.includes(to)) ||
          (normalizedPickup.includes(to) && normalizedDropoff.includes(from))
        );
      });

      if (matchedZone) {
        return parseFloat(matchedZone.price || 0);
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (!journeyDateTime || discounts.length === 0) return;

    const match = discounts.find(d =>
      d.status === 'Active' &&
      d.category === 'Surcharge' &&
      new Date(d.fromDate) <= journeyDateTime &&
      new Date(d.toDate) >= journeyDateTime
    );

    setMatchedSurcharge(match?.surchargePrice || 0);
  }, [journeyDateTime, discounts]);

  useEffect(() => {
    if (!journeyDateTime || discounts.length === 0) return;

    const surchargeMatch = discounts.find(d =>
      d.status === 'Active' &&
      d.category === 'Surcharge' &&
      new Date(d.fromDate) <= journeyDateTime &&
      new Date(d.toDate) >= journeyDateTime
    );

    setMatchedSurcharge(surchargeMatch?.surchargePrice || 0);

    const discountMatch = discounts.find(d =>
      d.status === 'Active' &&
      d.category === 'Discount' &&
      new Date(d.fromDate) <= journeyDateTime &&
      new Date(d.toDate) >= journeyDateTime
    );

    setMatchedDiscount(discountMatch?.discountPrice || 0);
  }, [journeyDateTime, discounts]);

  useEffect(() => {
    if (formData?.date && formData?.hour !== undefined && formData?.minute !== undefined) {
      const dt = new Date(formData.date);
      dt.setHours(Number(formData.hour));
      dt.setMinutes(Number(formData.minute));
      setJourneyDateTime(dt);
    }
  }, [formData]);

  useEffect(() => {
    const price = matchFixedPrice();
    setFixedZonePrice(price);
  }, [formData?.pickup, formData?.dropoff, fixedPrices]);

  useEffect(() => {
    if (zones.length > 0 && formData?.pickup && formData?.dropoff) {
      const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(' ').filter(Boolean);

      const pickupWords = normalize(formData.pickup);
      const dropoffWords = normalize(formData.dropoff);

      const pickupMatch = zones.find(z => pickupWords.includes(z.zone.toLowerCase()));
      const dropoffMatch = zones.find(z => dropoffWords.includes(z.zone.toLowerCase()));

      const matched = pickupMatch || dropoffMatch;

      if (matched) {
        setMatchedZonePrice(matched.price);
      } else {
        setMatchedZonePrice(null);
      }
    }
  }, [zones, formData]);

  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "setHeight", height }, "*");
    };
    sendHeight();
    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, []);

  const getLatLng = async (address) => {
    const res = await triggerGeocode({ address, companyId }).unwrap();
    return res?.location || null;
  };

  useEffect(() => {
    const isEdit = new URLSearchParams(window.location.search).get("isEdit") === "true";
    const delay = isEdit ? 200 : 0;

    const timer = setTimeout(() => {
      const storedForm = localStorage.getItem("bookingForm");
      if (!storedForm) return;

      const data = JSON.parse(storedForm);
      setFormData(data);

      const allDropoffs = [
        data.dropoff,
        data.additionalDropoff1,
        data.additionalDropoff2,
        data.additionalDropoff3,
        data.additionalDropoff4,
      ].filter(Boolean);

      calculateRoute(data.pickup, allDropoffs);

      const pickupCode = extractPostcode(data.pickup);
      const dropoffCode = extractPostcode(data.dropoff);
      setPickupPostcode(pickupCode);
      setDropoffPostcode(dropoffCode);
    }, delay);

    return () => clearTimeout(timer);
  }, [calculateRoute]);

  useEffect(() => {
    const allDropoffs = [
      formData?.dropoff,
      formData?.additionalDropoff1,
      formData?.additionalDropoff2,
      formData?.additionalDropoff3,
      formData?.additionalDropoff4,
    ].filter(d => d && d.trim());

    if (allDropoffs.length > 1) {
      setMatchedPostcodePrice(null);
      setFixedZonePrice(null);
      setMatchedZonePrice(null);
      setMatchedZoneToZonePrice(null);
      return;
    }

    if (pickupPostcode && dropoffPostcode && postcodePrices.length > 0) {
      const match = postcodePrices.find(item =>
        (item.pickup.toUpperCase() === pickupPostcode && item.dropoff.toUpperCase() === dropoffPostcode) ||
        (item.pickup.toUpperCase() === dropoffPostcode && item.dropoff.toUpperCase() === pickupPostcode)
      );
      setMatchedPostcodePrice(match || null);
    } else {
      setMatchedPostcodePrice(null);
    }
  }, [pickupPostcode, dropoffPostcode, postcodePrices, formData]);

  useEffect(() => {
    const isEdit = new URLSearchParams(window.location.search).get("isEdit") === "true";

    if (isEdit) return;
    try {
      const savedData = localStorage.getItem("bookingForm");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (err) {
      console.error("Error parsing bookingForm from localStorage:", err);
    }
  }, []);


  const getActivePricingMode = () => {
    const allDropoffs = [
      formData?.dropoff,
      formData?.additionalDropoff1,
      formData?.additionalDropoff2,
      formData?.additionalDropoff3,
      formData?.additionalDropoff4,
    ].filter(d => d && d.trim());

    if (allDropoffs.length > 1) return 'mileage';
    if (matchedPostcodePrice) return "postcode";
    if (fixedZonePrice !== null) return "zone";
    return 'mileage';
  };

  const activePricingMode = getActivePricingMode();

  useEffect(() => {
    const selectedCar = carList.find(c => c._id === selectedCarId);
    if (!selectedCar) {
      setCalculatedTotalPrice(0);
      return;
    }

    const raw = selectedCar.percentageIncrease ?? 0;
    const cleanPercentage = typeof raw === "string" ? Number(raw.replace("%", "")) : Number(raw);
    const percentage = isNaN(cleanPercentage) ? 0 : cleanPercentage;

    let coreFare = 0;
    switch (activePricingMode) {
      case 'postcode':
        coreFare = matchedPostcodePrice?.price || 0;
        break;
      case 'zone':
        coreFare = fixedZonePrice !== null ? fixedZonePrice : matchedZoneToZonePrice || 0;
        break;
      default:
        coreFare = getVehiclePriceForDistance(selectedCar, actualMiles || 0);
        break;
    }

    const durationUnits = Math.ceil(roundedGoogleMinutes / 30);
    const fullDurationCharge = durationUnits * (selectedCar.halfHourPrice || 0);

    const baseWithMarkup =
      (activePricingMode === 'postcode' || activePricingMode === 'zone')
        ? coreFare + (coreFare * (percentage / 100))
        : coreFare;

    const surchargeAmount = baseWithMarkup * (matchedSurcharge / 100);

    const discountAmount = baseWithMarkup * (matchedDiscount / 100);

    const primaryJourneyFare =
      baseWithMarkup +
      surchargeAmount -
      discountAmount +
      (matchedZonePrice || 0) +
      (dropOffPrice || 0) +
      fullDurationCharge;

    const primaryAirportFee = calculatePrimaryAirportFees();

    const grandTotal = parseFloat(
      (Number(primaryJourneyFare) +
        primaryAirportFee
      ).toFixed(2)
    );

    setCalculatedTotalPrice(grandTotal + (extraHelpPrice || 0));
  }, [
    selectedCarId,
    carList,
    activePricingMode,
    matchedPostcodePrice,
    fixedZonePrice,
    matchedZoneToZonePrice,
    matchedZonePrice,
    matchedSurcharge,
    dropOffPrice,
    matchedDiscount,
    getVehiclePriceForDistance,
    extraHelpPrice
  ]);

  const handleSubmitBooking = () => {
    if (!selectedCarId || !formData) {
      toast.error("Please select a vehicle to continue.");
      return;
    }

    const selectedCar = carList.find(car => car._id === selectedCarId);
    const primaryJourneyFare = computedPrimaryFare;

    const vehiclePayload = {
      vehicleName: selectedCar.vehicleName,
      passengerSeats: selectedCar.passengerSeats || 0,
      maxSeats: selectedCar.passengerSeats || 0,
      baseFare: primaryJourneyFare,
      totalFare: calculatedTotalPrice,
      extraHelp: selectedHelpOption ? {
        label: selectedHelpOption.label,
        price: selectedHelpOption.price
      } : null
    };

    onNext({
      totalPrice: calculatedTotalPrice,
      baseFare: primaryJourneyFare,
      selectedCar: vehiclePayload,
      segmentBreakdown,
      googleMinutes,
      roundedGoogleMinutes,
    });
  };

  const selectedCar = React.useMemo(
    () => carList.find(c => c._id === selectedCarId),
    [carList, selectedCarId]
  );

  const computedPrimaryFare = React.useMemo(() => {
    if (!selectedCar) return 0;

    const raw = selectedCar.percentageIncrease ?? 0;
    const cleanPercentage = typeof raw === "string" ? Number(raw.replace("%", "")) : Number(raw);
    const percentage = isNaN(cleanPercentage) ? 0 : cleanPercentage;

    let coreFare = 0;
    switch (activePricingMode) {
      case 'postcode':
        coreFare = matchedPostcodePrice?.price || 0;
        break;
      case 'zone':
        coreFare = fixedZonePrice !== null ? fixedZonePrice : matchedZoneToZonePrice || 0;
        break;
      default:
        coreFare = getVehiclePriceForDistance(selectedCar, actualMiles || 0);
        break;
    }

    const durationUnits = Math.ceil(roundedGoogleMinutes / 30);
    const fullDurationCharge = durationUnits * (selectedCar.halfHourPrice || 0);

    const baseWithMarkup =
      (activePricingMode === 'postcode' || activePricingMode === 'zone')
        ? coreFare + (coreFare * (percentage / 100))
        : coreFare;

    return baseWithMarkup + fullDurationCharge;
  }, [
    selectedCar,
    activePricingMode,
    matchedPostcodePrice,
    fixedZonePrice,
    matchedZoneToZonePrice,
    getVehiclePriceForDistance,
    matchedSurcharge,
    matchedZonePrice,
    dropOffPrice
  ]);


  useEffect(() => {
    if (!selectedCarId) return;
    const pricing = {
      totalPrice: Number(calculatedTotalPrice || 0),
      dropOffPrice: Number(formData?.dropOffPrice || 0),
      baseFare: Number(computedPrimaryFare || 0),
      journeyType: "oneWay",
      currencyCode,
      currencySymbol,
      segmentBreakdown,
      extraHelp: selectedHelpOption ? {
        label: selectedHelpOption.label,
        price: selectedHelpOption.price
      } : null
    };
    localStorage.setItem("widgetPricing", JSON.stringify(pricing));

    const sv = JSON.parse(localStorage.getItem("selectedVehicle") || "{}");
    if (sv && sv.id === selectedCarId) {
      localStorage.setItem("selectedVehicle", JSON.stringify({
        ...sv,
        extraHelp: pricing.extraHelp
      }));
    }
  }, [
    calculatedTotalPrice,
    selectedCarId,
    computedPrimaryFare,

    formData?.dropOffPrice,
    currencyCode,
    currencySymbol,
    segmentBreakdown,
  ]);
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 sm:px-6 lg:px-8 py-8">
        <div className="2xl:col-span-8 col-span-12 2xl:col-start-3 col-start-1 w-full">
          <WidgetStepHeader
            step="2"
            title="Vehicle Selection"
            description="Select the vehicle that best fits your requirements and budget for a seamless moving experience."
          />
          <JourneySummaryCard
            formData={formData}
            actualMiles={actualMiles}
            distanceText={distanceText}
            durationText={durationText}
            currencySymbol={currencySymbol}
            currencyCode={currencyCode}
            segmentBreakdown={segmentBreakdown}
          />

          <div className='mt-6'>
            {carList.length > 0 ? (
              <CarCardSection
                carList={carList.map((car) => {
                  let base = 0;
                  const raw = car.percentageIncrease ?? 0;
                  const percentage = isNaN(parseFloat(raw)) ? 0 : parseFloat(raw);

                  const durationUnits = Math.ceil(roundedGoogleMinutes / 30);
                  const fullDurationCharge = durationUnits * (car.halfHourPrice || 0);

                  if (fixedZonePrice !== null) {
                    base = fixedZonePrice + (fixedZonePrice * (percentage / 100));
                  } else if (matchedZoneToZonePrice !== null) {
                    base = matchedZoneToZonePrice + (matchedZoneToZonePrice * (percentage / 100));
                  } else if (matchedPostcodePrice) {
                    base = matchedPostcodePrice.price + (matchedPostcodePrice.price * (percentage / 100));
                  } else {
                    base = getVehiclePriceForDistance(car, actualMiles || 0);
                  }

                  return {
                    ...car,
                    price: base,
                  };
                })}
                currencySymbol={currencySymbol}
                currencyCode={currencyCode}
                selectedCarId={selectedCarId}
                formData={formData}
                savedExtraHelpPrice={extraHelpPrice}
                googleMinutes={googleMinutes}
                roundedGoogleMinutes={roundedGoogleMinutes}
                onSelect={(id) => {
                  setSelectedCarId(id);
                  const selectedCar = carList.find(car => car._id === id);
                  if (selectedCar) {
                    localStorage.setItem("selectedVehicle", JSON.stringify({
                      id,
                      vehicleName: selectedCar.vehicleName,
                      image: selectedCar.image || IMAGES.dummyFile,
                      passengerSeats: selectedCar.passengerSeats || 0,
                      maxSeats: selectedCar.passengerSeats || 0,
                      halfHourPrice: selectedCar.halfHourPrice
                    }));
                  }
                }}
                onBook={handleSubmitBooking}
                onHelpSelect={(option) => {
                  setExtraHelpPrice(option.price);
                  setSelectedHelpOption(option);
                }}
                calculatedTotalPrice={calculatedTotalPrice}
                primaryJourneyFare={computedPrimaryFare}
              />
            ) : (
              <div className="p-12 bg-(--white) rounded-2xl border-2 border-dashed border-gray-100 text-center italic text-gray-400">
                No vehicles found. Please add vehicles from the dashboard.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WidgetBookingInformation;
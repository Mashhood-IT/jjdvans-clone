import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CarCardSection from './widgetcomponents/CarCardSection';
import JourneySummaryCard from './widgetcomponents/JourneySummaryCard';
import WidgetStepHeader from './widgetcomponents/WidgetStepHeader';

import { toast } from 'react-toastify';
import IMAGES from '../../../assets/images';
import { useLazyGeocodeQuery, useLazyGetDistanceQuery } from '../../../redux/api/googleApi';

import { useGetAllVehiclesQuery } from '../../../redux/api/vehicleApi';
import { useGetPublicBookingSettingQuery } from '../../../redux/api/bookingSettingsApi';

const WidgetBookingInformation = ({
  onNext,
  dropOffPrice,
}) => {
  const { data: vehicleResponse, isLoading: isVehiclesLoading } = useGetAllVehiclesQuery();
  const carList = vehicleResponse?.data || vehicleResponse || [];

  const companyId = new URLSearchParams(window.location.search).get("company") || "";
  const { data: bookingSettingData } = useGetPublicBookingSettingQuery(companyId, {
    skip: !companyId
  });

  const [actualMiles, setActualMiles] = useState(null);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [distanceText, setDistanceText] = useState(null);
  const [durationText, setDurationText] = useState(null);
  const [matchedZonePrice, setMatchedZonePrice] = useState(null);
  const [matchedZoneToZonePrice, setMatchedZoneToZonePrice] = useState(null);
  const [fixedZonePrice, setFixedZonePrice] = useState(null);
  const [journeyDateTime, setJourneyDateTime] = useState(null);
  const [matchedSurcharge, setMatchedSurcharge] = useState(0);
  const [matchedDiscount, setMatchedDiscount] = useState(0);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);
  const [extraHelpPrice, setExtraHelpPrice] = useState(0);
  const [segmentBreakdown, setSegmentBreakdown] = useState([]);

  const [triggerGeocode] = useLazyGeocodeQuery();
  const [triggerDistance] = useLazyGetDistanceQuery();
  const postcodePrices = [];
  const zones = [];
  const generalPricing = {
    pickupAirportPrice: 10,
    dropoffAirportPrice: 10,
    minAdditionalDropOff: 5
  };
  const fixedPrices = [];
  const discounts = [];

  const currencySetting = bookingSettingData?.setting?.currency?.[0] || null;
  const currencySymbol = currencySetting?.symbol || '£';
  const currencyCode = currencySetting?.value || 'GBP';

  const isPickupAirport = formData?.pickup?.toLowerCase()?.includes('airport');
  const isDropoffAirport = formData?.dropoff?.toLowerCase()?.includes('airport');


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
    
    // Normal mode - immediate load
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
    
    // In edit mode, wait for parent to seed data
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

      if (!storedForm) {
        toast.error("No booking form found.");
        return;
      }

      const data = JSON.parse(storedForm);
      setFormData(data);

      if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
        setSegmentBreakdown(data.segments);

        const totalMiles = data.segments.reduce((sum, seg) => sum + seg.miles, 0);
        setActualMiles(totalMiles);
        setDistanceText(`${totalMiles.toFixed(2)} mi`);

        const totalSeconds = data.segments.reduce((sum, seg) => sum + (seg.durationValue || 0), 0);
        if (totalSeconds > 0) {
          const totalMinutes = Math.max(120, Math.round(totalSeconds / 60));
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          setDurationText(`${hours} hours ${mins} mins`);
        } else {
          setDurationText(data.segments.map((s) => s.durationText).join(" + "));
        }
      }


      const calculateMultiSegmentDistance = async () => {
        const allDropoffs = [
          data.dropoff,
          data.additionalDropoff1,
          data.additionalDropoff2,
          data.additionalDropoff3,
          data.additionalDropoff4,
        ].filter(d => {
          if (!d || !d.trim()) return false;
          return d.includes(' - ') || d.includes(',') || d.split(' ').length >= 3;
        });

        const hasMultipleDropoffs = allDropoffs.length > 1;

        const origin = data.pickup?.replace("Custom Input - ", "").split(" - ").pop()?.trim();

        if (!origin) {
          toast.error("Invalid pickup location");
          return;
        }

        try {
          let totalMiles = 0;
          let segments = [];

          if (hasMultipleDropoffs) {

            let currentOrigin = origin;
            let currentOriginAddress = data.pickup;

            for (let i = 0; i < allDropoffs.length; i++) {

              const destinationAddress = allDropoffs[i];
              const destination = destinationAddress.replace("Custom Input - ", "").split(" - ").pop()?.trim();

              const res = await triggerDistance({ origin: currentOrigin, destination, companyId }).unwrap();

              if (!res?.distanceText) {
                console.error(`Failed to get distance for segment ${i + 1}`);
                continue;
              }

              let segmentMiles = 0;
              if (res.distanceText.includes("km")) {
                const km = parseFloat(res.distanceText.replace("km", "").trim());
                segmentMiles = parseFloat((km * 0.621371).toFixed(2));
              } else if (res.distanceText.includes("mi")) {
                segmentMiles = parseFloat(res.distanceText.replace("mi", "").trim());
              }

              segments.push({
                segmentNumber: i + 1,
                from: currentOriginAddress,
                to: destinationAddress,
                miles: segmentMiles,
                distanceText: res.distanceText,
                durationText: res.durationText,
                durationValue: res.durationValue,
              });

              totalMiles += segmentMiles;

              currentOrigin = destination;
              currentOriginAddress = destinationAddress;
            }

            setSegmentBreakdown(segments);
            setActualMiles(totalMiles);
            setDistanceText(`${totalMiles.toFixed(2)} mi`);

            const totalSeconds = segments.reduce((sum, seg) => sum + (seg.durationValue || 0), 0);
            const totalMinutes = Math.max(120, Math.round(totalSeconds / 60));
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            setDurationText(`${hours} hours ${mins} mins`);

            const updatedData = { ...data, segments };
            localStorage.setItem("bookingForm", JSON.stringify(updatedData));

          } else {
            const destination = allDropoffs[0]?.replace("Custom Input - ", "").split(" - ").pop()?.trim();

            if (!destination) {
              toast.error("Invalid dropoff location");
              return;
            }

            const res = await triggerDistance({ origin, destination, companyId }).unwrap();

            if (res?.distanceText?.includes("km")) {
              const km = parseFloat(res.distanceText.replace("km", "").trim());
              totalMiles = parseFloat((km * 0.621371).toFixed(2));
              setDistanceText(`${totalMiles} miles`);
              setActualMiles(totalMiles);
            } else if (res?.distanceText?.includes("mi")) {
              totalMiles = parseFloat(res.distanceText.replace("mi", "").trim());
              setDistanceText(`${totalMiles} miles`);
              setActualMiles(totalMiles);
            }

            const totalMinutes = Math.max(120, Math.round((res?.durationValue || 0) / 60));
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            setDurationText(`${hours} hours ${mins} mins`);

            const singleSegment = [{
              segmentNumber: 1,
              from: data.pickup,
              to: allDropoffs[0],
              miles: totalMiles,
              distanceText: res?.distanceText || "",
              durationText: res?.durationText || "",
              durationValue: res?.durationValue || 0,
            }];
            setSegmentBreakdown(singleSegment);

            const updatedData = { ...data, segments: singleSegment };
            localStorage.setItem("bookingForm", JSON.stringify(updatedData));
          }

          const [pickupCoord, dropoffCoord] = await Promise.all([
            getLatLng(origin),
            getLatLng(allDropoffs[allDropoffs.length - 1]?.replace("Custom Input - ", "").split(" - ").pop()?.trim())
          ]);

          setFormData({
            ...data,
            pickupCoordinates: pickupCoord ? [pickupCoord] : [],
            dropoffCoordinates: dropoffCoord ? [dropoffCoord] : [],
          });

        } catch (err) {
          console.error('Distance calculation error:', err);
          toast.warn("Distance calculation failed.");
        }
      };

      calculateMultiSegmentDistance();

      const pickupCode = extractPostcode(data.pickup);
      const dropoffCode = extractPostcode(data.dropoff);
      setPickupPostcode(pickupCode);
      setDropoffPostcode(dropoffCode);
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);

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

  const calculateSegmentWiseFare = useCallback((vehicle) => {
    if (!segmentBreakdown || segmentBreakdown.length === 0) {
      return getVehiclePriceForDistance(vehicle, actualMiles || 0);
    }

    if (segmentBreakdown.length === 1) {
      return getVehiclePriceForDistance(vehicle, segmentBreakdown[0].miles);
    }

    let totalFare = 0;

    segmentBreakdown.forEach((segment) => {
      const segmentFare = getVehiclePriceForDistance(vehicle, segment.miles);
      totalFare += segmentFare;
    });


    return totalFare;
  }, [segmentBreakdown, getVehiclePriceForDistance, currencySymbol, actualMiles]);

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
        coreFare = calculateSegmentWiseFare(selectedCar);
        break;
    }

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
      (dropOffPrice || 0)

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
    calculateSegmentWiseFare,
    extraHelpPrice
  ]);


  const [selectedHelpOption, setSelectedHelpOption] = useState(null);

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
        coreFare = calculateSegmentWiseFare(selectedCar);
        break;
    }

    const baseWithMarkup =
      (activePricingMode === 'postcode' || activePricingMode === 'zone')
        ? coreFare + (coreFare * (percentage / 100))
        : coreFare;

    return baseWithMarkup;
  }, [
    selectedCar,
    activePricingMode,
    matchedPostcodePrice,
    fixedZonePrice,
    matchedZoneToZonePrice,
    calculateSegmentWiseFare,
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
            {isVehiclesLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-(--white) rounded-2xl border-2 border-dashed border-gray-100 italic text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--main-color) mb-4"></div>
                Loading available vehicles...
              </div>
            ) : carList.length > 0 ? (
              <CarCardSection
                carList={carList.map((car) => {
                  let base = 0;
                  const raw = car.percentageIncrease ?? 0;
                  const percentage = isNaN(parseFloat(raw)) ? 0 : parseFloat(raw);

                  if (fixedZonePrice !== null) {
                    base = fixedZonePrice + (fixedZonePrice * (percentage / 100));
                  } else if (matchedZoneToZonePrice !== null) {
                    base = matchedZoneToZonePrice + (matchedZoneToZonePrice * (percentage / 100));
                  } else if (matchedPostcodePrice) {
                    base = matchedPostcodePrice.price + (matchedPostcodePrice.price * (percentage / 100));
                  } else {
                    base = calculateSegmentWiseFare(car);
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
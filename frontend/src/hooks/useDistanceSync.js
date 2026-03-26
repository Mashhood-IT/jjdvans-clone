import { useState, useCallback, useEffect } from 'react';
import { useLazyGetDistanceQuery } from '../redux/api/googleApi';
import { formatMinutesToHM } from '../utils/durationHelper';

const useDistanceSync = (companyId) => {
  const [triggerDistance] = useLazyGetDistanceQuery();
  const [distanceInfo, setDistanceInfo] = useState({
    distanceText: '',
    durationText: '',
    realDurationText: '',
    miles: 0,
    googleMinutes: 0,
    roundedGoogleMinutes: 120,
    segments: [],
    loading: false
  });

  const calculateRoute = useCallback(async (pickup, dropoffs) => {
    if (!pickup || !dropoffs || !dropoffs[0]) return;

    setDistanceInfo(prev => ({ ...prev, loading: true }));

    const allDropoffs = dropoffs.filter(d => d && d.trim());
    const origin = pickup.replace("Custom Input - ", "").split(" - ").pop()?.trim();

    try {
      let totalMeters = 0;
      let totalSeconds = 0;
      let segments = [];
      let currentOrigin = origin;
      let currentOriginAddress = pickup;

      for (let i = 0; i < allDropoffs.length; i++) {
        const destinationAddress = allDropoffs[i];
        const destination = destinationAddress.replace("Custom Input - ", "").split(" - ").pop()?.trim();

        const res = await triggerDistance({ origin: currentOrigin, destination, companyId }).unwrap();

        if (!res) continue;

        const segmentMeters = res.distanceValue || 0;
        const segmentSeconds = res.durationValue || 0;

        totalMeters += segmentMeters;
        totalSeconds += segmentSeconds;

        segments.push({
          segmentNumber: i + 1,
          from: currentOriginAddress,
          to: destinationAddress,
          miles: parseFloat((segmentMeters / 1609.344).toFixed(2)),
          distanceText: res.distanceText,
          durationText: res.durationText,
          durationValue: segmentSeconds,
        });

        currentOrigin = destination;
        currentOriginAddress = destinationAddress;
      }

      const totalMiles = parseFloat((totalMeters / 1609.344).toFixed(2));
      const rawMins = totalSeconds / 60;
      const roundedMins = Math.max(120, Math.ceil(rawMins / 30) * 30);

const roundedRealMins = Math.ceil(rawMins);
const { hours: realHours, minutes: realMins } = formatMinutesToHM(roundedRealMins);      const { hours, minutes: mins } = formatMinutesToHM(roundedMins);

      const newInfo = {
        distanceText: `${totalMiles.toFixed(2)} mi`,
        durationText: `${hours} hours ${mins} mins`,
        realDurationText: `${realHours} hours ${realMins} mins`,
        miles: totalMiles,
        googleMinutes: rawMins,
        roundedGoogleMinutes: roundedMins,
        segments,
        loading: false
      };

      setDistanceInfo(newInfo);
      
      const savedForm = JSON.parse(localStorage.getItem('bookingForm') || '{}');
      localStorage.setItem('bookingForm', JSON.stringify({
        ...savedForm,
        segments,
        distanceText: newInfo.distanceText,
        durationText: newInfo.durationText,
        miles: totalMiles,
        googleMinutes: rawMins,
        roundedGoogleMinutes: roundedMins
      }));

      return newInfo;
    } catch (err) {
      console.error('Distance calculation error:', err);
      setDistanceInfo(prev => ({ ...prev, loading: false }));
      return null;
    }
  }, [triggerDistance, companyId]);

  useEffect(() => {
    const savedForm = localStorage.getItem('bookingForm');
    if (savedForm) {
      try {
        const data = JSON.parse(savedForm);
        if (data.distanceText || (data.segments && data.segments.length > 0)) {
          const realDurText = data.googleMinutes ? (() => {
const { hours, minutes } = formatMinutesToHM(Math.ceil(data.googleMinutes));            return `${hours} hours ${minutes} mins`;
          })() : '';
          setDistanceInfo({
            distanceText: data.distanceText || '',
            durationText: data.durationText || '',
            realDurationText: realDurText,
            miles: data.miles || 0,
            googleMinutes: data.googleMinutes || 0,
            roundedGoogleMinutes: data.roundedGoogleMinutes || 120,
            segments: data.segments || [],
            loading: false
          });
        }
      } catch (e) {
        console.error('Failed to parse bookingForm from storage', e);
      }
    }
  }, []);

  return {
    ...distanceInfo,
    calculateRoute
  };
};

export default useDistanceSync;

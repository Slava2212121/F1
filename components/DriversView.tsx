import React, { useState, useMemo, useEffect } from 'react';
import { DriverCard } from './DriverCard';
import { Driver } from '../types';
import { INITIAL_DRIVERS } from '../data/drivers';

interface DriversViewProps {
  searchQuery: string;
  firebaseData?: any[];
}

export const DriversView: React.FC<DriversViewProps> = ({ searchQuery, firebaseData = [] }) => {
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    return [...INITIAL_DRIVERS].sort((a, b) => b.points - a.points);
  });

  useEffect(() => {
    if (firebaseData && firebaseData.length > 0) {
      // Merge initial data with firebase data
      const merged = INITIAL_DRIVERS.map(driver => {
        const fbDriver = firebaseData.find(d => d.id === driver.id);
        return fbDriver ? { ...driver, ...fbDriver } : driver;
      });
      // Sort by points
      merged.sort((a, b) => b.points - a.points);
      setDrivers(merged);
    }
  }, [firebaseData]);

  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers;
    const lowerQuery = searchQuery.toLowerCase();
    return drivers.filter(driver => 
        driver.name?.toLowerCase().includes(lowerQuery) || 
        driver.team?.toLowerCase().includes(lowerQuery) ||
        driver.number?.toString().includes(lowerQuery)
    );
  }, [searchQuery, drivers]);

  return (
    <div className="pt-6 pb-24 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
        <h1 className="text-2xl font-display font-bold">Личный зачёт <span className="text-f1-red">2026</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDrivers.map((driver, index) => (
            <DriverCard key={driver.id} driver={driver} position={index + 1} />
        ))}
        {filteredDrivers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
                Пилоты не найдены
            </div>
        )}
      </div>
    </div>
  );
};


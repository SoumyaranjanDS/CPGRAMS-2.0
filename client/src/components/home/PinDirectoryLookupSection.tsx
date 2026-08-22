import React, { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import axios from 'axios';
import { Badge } from '../common/Badge.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { Card } from '../common/Card.js';

export const PinDirectoryLookupSection: React.FC = () => {
  const [pinInput, setPinInput] = useState('751001');
  const [resolvedLocation, setResolvedLocation] = useState<any>(null);
  const [pinLoading, setPinLoading] = useState(false);

  const handlePinLookup = async (pin: string) => {
    if (!pin || pin.length !== 6) return;
    setPinLoading(true);
    try {
      const res = await axios.get(`/api/v1/taxonomy/pin/${pin}`);
      setResolvedLocation(res.data.data);
    } catch {
      setResolvedLocation(null);
    } finally {
      setPinLoading(false);
    }
  };

  useEffect(() => {
    handlePinLookup('751001');
  }, []);

  return (
    <Card id="area-directory" padding="lg" className="p-6 sm:p-10 space-y-6 border-slate-200 bg-white shadow-xs rounded-2xl text-left w-full max-w-full">
      <div className="flex items-start sm:items-center justify-between border-b border-slate-200 pb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB]">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0A2540] tracking-tight">
              Jurisdiction &amp; Nodal Area Directory Lookup
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5">
              Verify your territorial jurisdiction by entering your 6-digit Indian Postal PIN Code.
            </p>
          </div>
        </div>
        <Badge variant="blue" className="text-xs sm:text-sm px-3 py-1 font-bold shrink-0">
          Area Directory
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="flex-1">
          <Input
            label="Enter 6-Digit Indian Postal PIN Code"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              if (e.target.value.length === 6) {
                handlePinLookup(e.target.value);
              }
            }}
            maxLength={6}
            placeholder="e.g. 751001, 751024, 110001, 400001, 700001, 560001"
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="sm:self-end">
          <Button
            variant="primary"
            onClick={() => handlePinLookup(pinInput)}
            isLoading={pinLoading}
            className="w-full sm:w-auto font-bold text-sm sm:text-base px-6 py-3"
          >
            Lookup Authority
          </Button>
        </div>
      </div>

      {resolvedLocation && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-base sm:text-lg font-bold text-[#0A2540]">
              Identified Territorial Authority:
            </span>
            <Badge variant="blue" className="font-bold">Verified Jurisdiction</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div>
              <span className="text-slate-500 block text-xs sm:text-sm">State / UT:</span>
              <strong className="text-base sm:text-lg text-slate-900 font-extrabold">{resolvedLocation.state}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-xs sm:text-sm">District:</span>
              <strong className="text-base sm:text-lg text-slate-900 font-extrabold">{resolvedLocation.district}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-xs sm:text-sm">Sub-Division:</span>
              <strong className="text-base sm:text-lg text-slate-900 font-extrabold">{resolvedLocation.subDivision || 'Urban Division'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-xs sm:text-sm">Local Municipal Body:</span>
              <strong className="text-base sm:text-lg text-slate-900 font-extrabold">{resolvedLocation.localBody || 'Municipal Authority'}</strong>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

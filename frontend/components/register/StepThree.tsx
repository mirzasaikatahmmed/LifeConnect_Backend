'use client';

import { useState } from 'react';
import { RegistrationData } from './types';

interface StepThreeProps {
  data: RegistrationData;
  updateData: (data: Partial<RegistrationData>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepThree({ data, updateData, onBack, onSubmit }: StepThreeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit();
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (data.userType) {
      case 'donor':
        return (
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
              Blood Type
            </label>
            <select
              id="bloodType"
              name="bloodType"
              value={data.bloodType || ''}
              onChange={(e) => updateData({ bloodType: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        );

      case 'manager':
        return (
          <>
            <div>
              <label htmlFor="medicalLicense" className="block text-sm font-medium text-gray-700">
                Manager ID/License
              </label>
              <input
                type="text"
                id="medicalLicense"
                name="medicalLicense"
                value={data.medicalLicense || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-600">
                Optional manager identification number
              </p>
            </div>

            <div>
              <label htmlFor="hospitalAffiliation" className="block text-sm font-medium text-gray-700">
                Organization/Hospital
              </label>
              <input
                type="text"
                id="hospitalAffiliation"
                name="hospitalAffiliation"
                value={data.hospitalAffiliation || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </>
        );

      case 'admin':
        return (
          <div>
            <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700">
              Administrator Code
            </label>
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              required
              value={data.adminCode || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              Enter the administrator access code provided by your organization
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    switch (data.userType) {
      case 'donor':
        return 'Donor Information';
      case 'manager':
        return 'Manager Credentials';
      case 'admin':
        return 'Administrator Verification';
      default:
        return 'Additional Information';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">{getRoleTitle()}</h2>
        <p className="mt-2 text-sm text-gray-600">
          Complete your {data.userType} profile information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderRoleSpecificFields()}

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Summary</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Role:</span> {data.userType?.charAt(0).toUpperCase() + data.userType?.slice(1)}</p>
            <p><span className="font-medium">Name:</span> {data.name}</p>
            <p><span className="font-medium">Email:</span> {data.email}</p>
            {data.phoneNumber && <p><span className="font-medium">Phone:</span> {data.phoneNumber}</p>}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
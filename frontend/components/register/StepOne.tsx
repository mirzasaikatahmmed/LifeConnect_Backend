'use client';

import { UserRole, RegistrationData } from './types';

interface StepOneProps {
  data: RegistrationData;
  updateData: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}

export default function StepOne({ data, updateData, onNext }: StepOneProps) {
  const handleRoleSelect = (userType: UserRole) => {
    updateData({ userType });
  };

  const handleNext = () => {
    if (data.userType) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Choose Your Role</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select the role that best describes you
        </p>
      </div>

      <div className="space-y-4">
        <div
          onClick={() => handleRoleSelect('donor')}
          className={`cursor-pointer p-6 border-2 rounded-lg transition-colors ${
            data.userType === 'donor'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">D</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Donor</h3>
              <p className="text-sm text-gray-600">
                Donate blood, manage donation history, and help save lives
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleRoleSelect('manager')}
          className={`cursor-pointer p-6 border-2 rounded-lg transition-colors ${
            data.userType === 'manager'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">M</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manager</h3>
              <p className="text-sm text-gray-600">
                Manage blood requests, coordinate donations, and oversee blood bank operations
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleRoleSelect('admin')}
          className={`cursor-pointer p-6 border-2 rounded-lg transition-colors ${
            data.userType === 'admin'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">A</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Administrator</h3>
              <p className="text-sm text-gray-600">
                Manage the blood bank system, oversee operations, and handle user management
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!data.userType}
          className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
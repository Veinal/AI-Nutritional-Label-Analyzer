import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, createOrUpdateUserProfile } from '../services/databaseService';
import { UserProfile as UserProfileType } from '../services/databaseService';
import { X, Save, User } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}



const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getUserProfile();
      if (profile) {
        setName(profile.name || '');
        setAge(profile.age);
        setGender(profile.gender || '');
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const success = await createOrUpdateUserProfile(
        name || null,
        age,
        gender || null
      );

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError('Failed to save profile');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age || ''}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
                  min="1"
                  max="120"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg text-sm">
                Profile saved successfully!
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


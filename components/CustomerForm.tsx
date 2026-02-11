// CustomerForm.tsx
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
  Info
} from 'lucide-react';

interface CustomerFormProps {
  initialData?: Customer; // Added to support the editing logic in App.tsx
  onSave: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Sync with initialData if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="group p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialData ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Maintain your client directory and contact details.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Decorative accent bar */}
          <div className="h-1.5 w-full bg-indigo-600" />
          
          <div className="p-8 space-y-6">
            {/* NAME FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name / Company *
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                placeholder="e.g., Acme Corp or John Smith"
              />
            </div>

            {/* CONTACT ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* ADDRESS FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Billing / Shipping Address
              </label>
              <textarea
                name="address"
                rows={4}
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-900 resize-none"
                placeholder="Street address, City, State, ZIP code..."
              />
            </div>

            {/* HINT */}
            <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg text-blue-700">
               <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
               <p className="text-[11px] font-medium leading-relaxed uppercase tracking-tight">
                 Fields marked with * are required. Customer information is used for generating sales orders and invoices.
               </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`group relative flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all focus:ring-4 focus:ring-indigo-100 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            )}
            {loading ? 'Saving...' : initialData ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
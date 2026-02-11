// SupplierForm.tsx
import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
  Truck
} from 'lucide-react';

interface SupplierFormProps {
  initialData?: Supplier; // Added to support the editing logic from App.tsx
  onSave: (supplier: Omit<Supplier, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ initialData, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
  });

  // Sync with initialData if we are in "Edit" mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        contact_person: initialData.contact_person || '',
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
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {initialData ? 'Update Supplier' : 'Add New Supplier'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your procurement partners and vendor info.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          {/* Decorative emerald accent bar */}
          <div className="h-1.5 w-full bg-emerald-500" />
          
          <div className="p-8 space-y-6">
            
            {/* COMPANY NAME SECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Company Name *
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 text-gray-900 font-medium"
                placeholder="e.g., Global Electronics Ltd"
              />
            </div>

            {/* CONTACT PERSON SECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-emerald-500" /> Primary Contact Person
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 text-gray-900 font-medium"
                placeholder="e.g., Jane Doe"
              />
            </div>

            {/* CONTACT ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-500" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                  placeholder="orders@supplier.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* ADDRESS SECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Warehouse / Office Address
              </label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-gray-400 text-gray-900 resize-none"
                placeholder="Enter full business address..."
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
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
            className={`group relative flex items-center justify-center px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200/50 hover:bg-emerald-700 hover:shadow-emerald-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all focus:ring-4 focus:ring-emerald-100 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            )}
            {loading ? 'Saving...' : initialData ? 'Update Supplier' : 'Register Supplier'}
          </button>
        </div>
      </form>

      {/* FOOTER HINT */}
      <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
        <Truck className="w-4 h-4" />
        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Procurement Module v1.0</p>
      </div>
    </div>
  );
};

export default SupplierForm;
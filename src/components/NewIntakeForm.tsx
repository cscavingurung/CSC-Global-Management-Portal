import { useState } from 'react';
import { Mountain, CheckCircle, User, Phone, Mail, Globe, Target, Calendar } from 'lucide-react';
import { COUNTRIES, PURPOSES } from '../mockData';

export interface IntakeFormData {
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  preferredDate: string;
}

interface NewIntakeFormProps {
  onSubmitted?: () => void;
  /** Renders as a bare card for embedding inside the dashboard instead of a standalone public page. */
  embedded?: boolean;
  /** Called with the form data on submit — required to actually persist the intake when embedded. */
  onSubmit?: (data: IntakeFormData) => void;
}

const EMPTY_FORM: IntakeFormData = {
  name: '',
  phone: '',
  email: '',
  country: '',
  purpose: '',
  preferredDate: '',
};

export default function NewIntakeForm({ onSubmitted, embedded = false, onSubmit }: NewIntakeFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<IntakeFormData>(EMPTY_FORM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
    setSubmitted(true);
    onSubmitted?.();
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setSubmitted(false);
  };

  if (submitted) {
    const successCard = (
      <div className="w-full max-w-md bg-white rounded-2xl border border-grey-border p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-green-600" size={36} />
        </div>
        <h2 className="text-xl font-semibold text-navy mb-2">
          {embedded ? 'Student added' : 'Thanks — please wait'}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {embedded
            ? 'The student has been added as a new intake and is ready to be assigned to a counselor.'
            : "Your details have been received. Reception will call you shortly to confirm your consultation."}
        </p>
        <button
          onClick={handleReset}
          className="text-sm text-navy font-medium hover:text-navy-light transition-colors"
        >
          {embedded ? 'Add another student' : 'Submit another response'}
        </button>
      </div>
    );

    if (embedded) {
      return <div className="flex items-center justify-center py-10">{successCard}</div>;
    }

    return (
      <div className="min-h-screen bg-grey-bg flex flex-col">
        <header className="bg-navy px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <Mountain className="text-navy" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">CSC Global</p>
            <p className="text-white/50 text-xs">Student Intake</p>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">{successCard}</div>

        <footer className="bg-white border-t border-grey-border px-5 py-3 text-center">
          <p className="text-xs text-gray-400">CSC Global</p>
        </footer>
      </div>
    );
  }

  const formCard = (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-grey-border p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-navy mb-1">
          {embedded ? 'New Intake' : 'Welcome'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {embedded
            ? 'Log a walk-in or phone enquiry directly into the system.'
            : "Fill in your details and we'll arrange a consultation for you."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+61 4XX XXX XXX"
                className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
              />
            </div>
          </div>

          {/* Country of interest */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Country of interest</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <select
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors appearance-none bg-white"
              >
                <option value="" disabled>Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Purpose</label>
            <div className="relative">
              <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <select
                required
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors appearance-none bg-white"
              >
                <option value="" disabled>Select a purpose</option>
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred date/time */}
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Preferred consultation date & time</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <input
                type="datetime-local"
                required
                value={form.preferredDate}
                onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-navy text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-navy-light transition-colors active:scale-[0.98] mt-2"
          >
            {embedded ? 'Add Student' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="flex items-start justify-center py-2">{formCard}</div>;
  }

  return (
    <div className="min-h-screen bg-grey-bg flex flex-col">
      {/* Navy header bar */}
      <header className="bg-navy px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
          <Mountain className="text-navy" size={20} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">CSC Global</p>
          <p className="text-white/50 text-xs">Student Intake Form</p>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-5">{formCard}</div>

      <footer className="bg-white border-t border-grey-border px-5 py-3 text-center">
        <p className="text-xs text-gray-400">CSC Global</p>
      </footer>
    </div>
  );
}

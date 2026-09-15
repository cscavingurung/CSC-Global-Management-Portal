import { useState } from 'react';
import { Lock, Mail, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Role, MockUser } from '../types';
import { ROLE_LABELS, MOCK_USERS } from '../mockData';

interface LoginProps {
  onLogin: (user: MockUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles = Object.keys(ROLE_LABELS) as Role[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(MOCK_USERS[selectedRole]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-16">
          <div className="w-60 h-16 flex items-center justify-center">
            <img src="https://cscglobalcanada.ca/images/Logo.png" alt="Logo" />
          </div>
          <p className="text-gray text-sm">Management Portal</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-navy mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to access the portal.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Role</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="w-full flex items-center justify-between pl-4 pr-3 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
                >
                  <span className="text-navy font-medium">{ROLE_LABELS[selectedRole]}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {roleDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setRoleDropdownOpen(false)} />
                    <div className="absolute z-20 mt-1 w-full bg-white border border-grey-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                      {roles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            role === selectedRole
                              ? 'bg-navy text-white font-medium'
                              : 'text-navy hover:bg-grey-bg'
                          }`}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
             
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@everestvisa.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-navy text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-navy-light transition-colors active:scale-[0.98]"
            >
              Sign in
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

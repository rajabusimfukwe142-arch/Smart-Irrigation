import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, Mail, Phone, MapPin, KeyRound, Check, X, ShieldAlert, Users } from 'lucide-react';

interface Assistant {
  id: string;
  username: string;
  name: string;
  phone: string;
  role: string;
  email: string;
  region: string;
}

interface AssistantsViewProps {
  currentUser: {
    id: string;
    username: string;
    role: string;
  };
  language: 'SW' | 'EN';
  triggerToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function AssistantsView({ currentUser, language, triggerToast }: AssistantsViewProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('Morogoro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assistants
  const fetchAssistants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assistants?adminId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setAssistants(data.assistants);
      } else {
        triggerToast(language === 'SW' ? 'Imeshindwa kupakia orodha ya wasaidizi.' : 'Failed to load assistants list.', 'error');
      }
    } catch (e) {
      console.error(e);
      triggerToast(language === 'SW' ? 'Hitilafu ya mtandao kufikia wasaidizi.' : 'Network error getting assistants.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, [currentUser.id]);

  // Submit handler
  const handleRegisterAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      triggerToast(language === 'SW' ? 'Tafadhali jaza sehemu zote za lazima!' : 'Please fill in all required fields!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          name,
          username: username.trim(),
          password,
          phone: phone.trim(),
          email: email.trim(),
          region
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(
          language === 'SW'
            ? `Msaidizi ${name} amesajiliwa kikamilifu!`
            : `Assistant ${name} successfully registered!`,
          'success'
        );
        setName('');
        setUsername('');
        setPassword('');
        setPhone('');
        setEmail('');
        setShowForm(false);
        fetchAssistants();
      } else {
        triggerToast(data.error || 'Imeshindwa kusajili msaidizi.', 'error');
      }
    } catch (err) {
      triggerToast(language === 'SW' ? 'Hitilafu kuwasiliana na server.' : 'Server connection failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteAssistant = async (id: string, assName: string) => {
    if (!window.confirm(language === 'SW' ? `Je, una uhakika unataka kumfuta msaidizi ${assName}?` : `Are you sure you want to delete assistant ${assName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/assistants/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        triggerToast(
          language === 'SW'
            ? `Msaidizi ${assName} amefutwa kwenye mfumo.`
            : `Assistant ${assName} was deleted from the system.`,
          'success'
        );
        fetchAssistants();
      } else {
        triggerToast(data.error || 'Imeshindwa kufuta.', 'error');
      }
    } catch (e) {
      triggerToast(language === 'SW' ? 'Hitilafu wakati wa kufuta.' : 'Error during deletion.', 'error');
    }
  };

  return (
    <div id="assistants_mgmt_container" className="space-y-6">
      {/* Upper header action banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 block">
              <Users size={20} />
            </span>
            <span>{language === 'SW' ? 'Usimamizi wa Wasaidizi' : 'Assistant Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xl font-medium">
            {language === 'SW'
              ? 'Kama msimamizi (Admin), hapa unaweza kusajili wasaidizi watakaoweza kuingia kwenye mfumo kwa kutumia nenosiri lao, kuona shamba, na kukusaidia kuratibu umwagiliaji.'
              : 'As an admin, you can register assistants who can log in with their own credentials, view the farms, and help you schedule and manage irrigation.'}
          </p>
        </div>

        <button
          id="btn_add_assistant_toggle"
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer ${
            showForm 
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/10'
          }`}
        >
          {showForm ? <X size={15} /> : <UserPlus size={15} />}
          <span>
            {showForm 
              ? (language === 'SW' ? 'Funga Fomu' : 'Close Form') 
              : (language === 'SW' ? 'Sajili Msaidizi Mpya' : 'Register New Assistant')}
          </span>
        </button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <form 
          id="register_assistant_form"
          onSubmit={handleRegisterAssistant} 
          className="bg-white rounded-3xl border border-slate-150 shadow-lg p-6 space-y-4 animate-fadeIn transition-all"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus size={16} className="text-emerald-600" />
              <span>{language === 'SW' ? 'Fomu ya Usajili wa Msaidizi' : 'Assistant Registration Form'}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                {language === 'SW' ? 'Jina Kamili *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mfano: Daudi Kibwana"
                className="w-full border border-slate-200 rounded-xl py-2 px-3.5 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                {language === 'SW' ? 'Jina la Mtumiaji (Username) *' : 'Username *'}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="daudi2026"
                className="w-full border border-slate-200 rounded-xl py-2 px-3.5 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                {language === 'SW' ? 'Nenosiri la Kuingia (Password) *' : 'Login Password *'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Weka nenosiri..."
                  className="w-full border border-slate-200 rounded-xl py-2 px-3.5 pr-10 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
                <KeyRound size={15} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                {language === 'SW' ? 'Namba ya Simu' : 'Phone Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full border border-slate-200 rounded-xl py-2 pl-9 pr-3.5 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                {language === 'SW' ? 'Barua Pepe (Email)' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="daudi@gmail.com"
                  className="w-full border border-slate-200 rounded-xl py-2 pl-9 pr-3.5 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
                <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            {/* Region */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                {language === 'SW' ? 'Mkoa unaofanyia kazi' : 'Working Region'}
              </label>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded-xl py-2 pl-9 pr-3.5 text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Morogoro">Morogoro</option>
                  <option value="Dodoma">Dodoma</option>
                  <option value="Mbeya">Mbeya</option>
                  <option value="Iringa">Iringa</option>
                  <option value="Arusha">Arusha</option>
                </select>
                <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
            >
              {language === 'SW' ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/10 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>{language === 'SW' ? 'Inasajili...' : 'Registering...'}</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>{language === 'SW' ? 'Hifadhi & Sajili' : 'Save & Register'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Assistants list display */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <Shield size={16} className="text-emerald-600" />
            <span>{language === 'SW' ? 'Wasaidizi Waliosajiliwa' : 'Registered Assistants'}</span>
          </h3>
          <span className="text-[11px] font-extrabold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono">
            {language === 'SW' ? `Jumla: ${assistants.length}` : `Total: ${assistants.length}`}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-medium text-xs space-y-2">
            <div className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
            <p>{language === 'SW' ? 'Inapakia wasaidizi...' : 'Loading assistants...'}</p>
          </div>
        ) : assistants.length === 0 ? (
          <div className="p-12 text-center border-t border-slate-100">
            <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3 border border-slate-100">
              <Users size={28} />
            </div>
            <p className="text-slate-700 font-extrabold text-sm mb-1">
              {language === 'SW' ? 'Hujasajili msaidizi yeyote bado.' : 'No registered assistants yet.'}
            </p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
              {language === 'SW'
                ? 'Bofya kitufe cha "Sajili Msaidizi Mpya" kilicho juu ili kuongeza msaidizi wako wa kwanza kwenye mfumo.'
                : 'Click the "Register New Assistant" button above to add your first assistant to the system.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-100 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              + {language === 'SW' ? 'Ongeza Msaidizi' : 'Add Assistant'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3.5">{language === 'SW' ? 'Jina Kamili' : 'Full Name'}</th>
                  <th className="px-6 py-3.5">Username</th>
                  <th className="px-6 py-3.5">{language === 'SW' ? 'Mkoa' : 'Region'}</th>
                  <th className="px-6 py-3.5">{language === 'SW' ? 'Mawasiliano' : 'Contact'}</th>
                  <th className="px-6 py-3.5 text-right">{language === 'SW' ? 'Kitendo' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {assistants.map((ass) => (
                  <tr key={ass.id} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center">
                        {ass.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="block">{ass.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-sm">
                          {ass.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-600">
                      @{ass.username}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{ass.region}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium space-y-0.5">
                      {ass.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400 shrink-0" />
                          <span>{ass.phone}</span>
                        </span>
                      )}
                      {ass.email && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span>{ass.email}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteAssistant(ass.id, ass.name)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition active:scale-95 cursor-pointer"
                        title={language === 'SW' ? `Futa msaidizi ${ass.name}` : `Delete assistant ${ass.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
        <ShieldAlert className="text-emerald-700 shrink-0 mt-0.5" size={16} />
        <div className="text-[11px] text-emerald-800 font-semibold space-y-1">
          <p>
            {language === 'SW'
              ? 'KIDHIBITI USALAMA: Wasaidizi hawawezi kubadilisha wasifu wa Mhandisi Mkuu (Admin) au kufuta wakulima ambao hawajapewa haki nao, na nenosiri lao linahifadhiwa kwa hashing ya bcrypt thabiti ili kuzuia kuvuja.'
              : 'SECURITY CONTROL: Assistants cannot modify the main admin profile or delete critical assets they don’t own. All passwords are encrypted using secure bcrypt hashing before storage.'}
          </p>
        </div>
      </div>
    </div>
  );
}

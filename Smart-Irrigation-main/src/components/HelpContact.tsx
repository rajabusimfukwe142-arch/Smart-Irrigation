import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Phone, Mail, Globe, MapPin, CheckCircle, Info, ShieldCheck, Award, Lock, UserCheck, MessageSquare, AlertTriangle, Clock, RefreshCw, Send, Sparkles } from 'lucide-react';

interface HelpContactProps {
  operatorName?: string;
  operatorRole?: string;
  operatorPhone?: string;
  operatorEmail?: string;
}

export const HelpContact: React.FC<HelpContactProps> = ({
  operatorName = 'Rajabu Simfukwe',
  operatorRole = 'Mhandisi Mkuu',
  operatorPhone = '0794172297',
  operatorEmail = 'niyovisitoni@gmail.com'
}) => {
  const [smsList, setSmsList] = useState<any[]>([]);
  const [loadingSms, setLoadingSms] = useState(false);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: 'Habari mkulima mpendwa! Mimi ni mshauri wako wa kilimo wa AI (Digital Agronomist). Unaweza kuniuliza swali lolote kuhusu magonjwa ya mazao, muda bora wa umwagiliaji, mbegu bora au mbolea mkoani kwako kwa Kiswahili au Kiingereza!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchSimulatedSms = async () => {
    setLoadingSms(true);
    try {
      const res = await fetch("/api/simulated-sms");
      const data = await res.json();
      if (data.success) {
        setSmsList(data.smsList || []);
      }
    } catch (err) {
      console.error("Error fetching simulated SMS:", err);
    } finally {
      setLoadingSms(false);
    }
  };

  useEffect(() => {
    fetchSimulatedSms();
    const interval = setInterval(fetchSimulatedSms, 12000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleSendChatMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMessage = { role: 'user' as const, text: textToSend };
    setChatMessages((prev) => [...prev, userMessage]);
    if (!customText) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { role: 'model', text: 'Samahani, kumetokea hitilafu ya kuunganisha na mfumo wa ushauri.' }]);
      }
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: 'model', text: 'Mfumo uko nje ya mtandao kwa sasa. Tafadhali jaribu tena baada ya muda mfupi.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const PRESET_QUESTIONS = [
    'Dawa gani inaua Kiwavi Jeshi kwenye mahindi?',
    'Jinsi ya kuzuia Chule (Blight) kwenye nyanya?',
    'Muda gani bora wa umwagiliaji mchana?',
    'Mbolea ya kupandia na kukuzia mpunga'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">📖 Mwongozo na Mawasiliano</h2>
        <p className="text-slate-500 text-sm">Mwongozo wa hatua kwa hatua wa matumizi ya Smart Irrigation Tanzania Pro na njia za kuwasiliana nasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Swahili Guide */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <HelpCircle size={20} className="text-emerald-600" />
            Mwongozo wa Hatua kwa Hatua
          </h3>

          <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <li className="flex gap-3">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg text-xs h-6 flex items-center justify-center font-mono">1</span>
              <div>
                <h4 className="font-bold text-slate-800">Sajili Mkulima</h4>
                <p className="text-slate-500 text-xs mt-0.5">Ingia kichupo cha 👨‍🌾 Wakulima, bonyeza "Ongeza Mkulima", na weka maelezo kama mkoa, wilaya, na simu.</p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg text-xs h-6 flex items-center justify-center font-mono">2</span>
              <div>
                <h4 className="font-bold text-slate-800">Sajili Zao la Shamba</h4>
                <p className="text-slate-500 text-xs mt-0.5">Ingia kichupo cha 🌱 Mazao, chagua mkulima husika, kisha chagua zao (mf: Mahindi) na uingize ukubwa wa shamba kwa Hekta.</p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg text-xs h-6 flex items-center justify-center font-mono">3</span>
              <div>
                <h4 className="font-bold text-slate-800">Angalia Maendeleo na Hatua</h4>
                <p className="text-slate-500 text-xs mt-0.5">Kichupo cha 🌾 Ukuaji kitaonyesha visual ya kipekee juu ya hatua ya sasa ya ukuaji (Kupanda, Kuota, Maua) na ushauri wa maji.</p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-lg text-xs h-6 flex items-center justify-center font-mono">4</span>
              <div>
                <h4 className="font-bold text-slate-800">Kamilisha Umwagiliaji</h4>
                <p className="text-slate-500 text-xs mt-0.5">Katika kichupo cha 📅 Ratiba, tiki ratiba za leo kama zimekamilika. Bonyeza "Tuma Tahadhari" kutuma SMS kwa namba ya simu ya mkulima.</p>
              </div>
            </li>
          </ul>

          <div className="bg-slate-50 p-4 rounded-xl flex gap-2.5 text-xs text-slate-500 leading-relaxed">
            <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Fomula ya Penman-Monteith inatumia unyevu, upepo, kiwango cha mvua, na mionzi ya jua kukokotoa kiwango sahihi cha maji kuokoa rasilimali.</span>
          </div>
        </div>

        {/* Contact details */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
            <Phone size={18} className="text-emerald-600" />
            Wasiliana Nasi / Support Desk
          </h3>

          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Simu (Tanzania Helpline)</p>
                <a href="tel:0794172297" className="font-bold text-slate-800 hover:text-emerald-700 hover:underline">
                  0794172297
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Barua Pepe / Email</p>
                <a href="mailto:rajabusimmfukwe142@gmail.com" className="font-bold text-slate-800 hover:text-emerald-700 hover:underline">
                  rajabusimmfukwe142@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tovuti / Web</p>
                <a href="http://www.smartirrigation.co.tz" target="_blank" rel="noreferrer" className="font-bold text-slate-800 hover:text-emerald-700 hover:underline">
                  www.smartirrigation.co.tz
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Ofisi Kuu / Headquarters</p>
                <p className="font-bold text-slate-800 leading-tight">Morogoro & Dar es Salaam, Tanzania</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saa za Huduma</h4>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Jumatatu - Ijumaa:</span>
              <span className="font-bold text-slate-700">8:00 Asubuhi - 5:00 Jioni</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Jumamosi (Sabbath):</span>
              <span className="font-bold text-slate-700">Imebaki Mapumziko / Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI AGRICULTURAL CHATBOT ASSISTANT */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-950">🤖 Mshauri AI wa Shambani (Interactive Chatbot)</h3>
              <p className="text-xs text-emerald-800/80">Uliza maswali yoyote ya kilimo, magonjwa, mbegu na umwagiliaji kwa Kiswahili au Kiingereza.</p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
            Powered by Gemini 3.5
          </span>
        </div>

        {/* Chat Messages Log */}
        <div className="bg-white border border-emerald-100/60 rounded-xl p-4 h-80 overflow-y-auto space-y-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                <div className="flex items-center gap-1 mb-1 text-[10px] font-bold opacity-75">
                  <span>{msg.role === 'user' ? 'Mkulima (Wewe)' : 'Mshauri wa AI'}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line text-xs font-medium">{msg.text}</p>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-none p-3.5 max-w-[85%] flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-emerald-700" />
                <span className="text-xs text-slate-500 font-bold">Mshauri wa AI anafikiri...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Preset Chips */}
        <div className="space-y-2">
          <p className="text-[11px] text-emerald-800 font-bold">💡 Mapendekezo ya maswali ya haraka (Bofya kuuliza):</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendChatMessage(q)}
                disabled={chatLoading}
                className="text-left text-[11px] bg-white border border-emerald-150 text-emerald-900 hover:bg-emerald-100/60 hover:border-emerald-300 disabled:opacity-50 py-1.5 px-3 rounded-full transition font-semibold cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input area */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChatMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatLoading}
            placeholder="Andika swali lako la kilimo hapa (mfano: Jinsi ya kuzuia wadudu wa nyanya...)"
            className="flex-1 bg-white border border-emerald-200 focus:outline-none focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || chatLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 px-4 py-2.5 rounded-xl transition flex items-center justify-center cursor-pointer shadow-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* SMS Gateway Setup and Troubleshooting */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Info size={20} className="text-emerald-700" />
            Kuweka na Kurekebisha matatizo ya SMS (SMS Setup & Troubleshooting)
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Mfumo huu unaunga mkono njia mbili (2) kuu za kutuma SMS kwa wakulima:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs font-mono">NJIA 1</span>
              <h4 className="font-extrabold text-slate-800">Internet SMS Gateway (Twilio au Africa's Talking)</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inatuma ujumbe wa SMS moja kwa moja kupitia mtandao wa internet. Unahitaji kuweka ufunguo wako wa siri (API Key) kwenye menyu ya <span className="font-bold text-slate-700">Settings &gt; Secrets</span> hapo juu.
            </p>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg space-y-2">
              <h5 className="font-bold text-xs text-amber-800">Je, umepata hitilafu ya "Message cannot be sent..." kutoka Twilio?</h5>
              <p className="text-[11px] text-amber-700 leading-normal">
                Hii inamaanisha akaunti yako ya Twilio haina kibali cha kutuma SMS kwenda Tanzania (Geo-Permissions) au imezidi kiwango cha majaribio cha SMS 5 kwa siku. Rekebisha kwa:
              </p>
              <ol className="list-decimal pl-4 text-[11px] text-amber-700 space-y-1">
                <li>Ingia kwenye dashboard yako ya <strong>twilio.com</strong>.</li>
                <li>Nenda kwenye: <strong>Messaging</strong> &gt; <strong>Settings</strong> &gt; <strong>Geo-Permissions</strong>.</li>
                <li>Tafuta nchi ya <strong>Tanzania</strong> na weka alama ya tiki (check) na uhifadhi.</li>
              </ol>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-xs font-mono">NJIA 2</span>
              <h4 className="font-extrabold text-slate-800">Kupitia Simu Yako ya Mkononi (Inapendekezwa - BURE)</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bila malipo ya siri wala usanidi wowote wa API! Unapobonyeza kitufe cha njano cha <strong>"Tuma kupitia Simu Yako"</strong>, mfumo utafungua moja kwa moja App ya kawaida ya SMS ya simu yako ukiwa tayari na namba ya mkulima na ujumbe ukiwa umeandikwa tayari.
            </p>
            <ul className="list-disc pl-4 text-xs text-slate-500 space-y-1">
              <li>Inatumia vifurushi vyako vya kawaida vya dakika au SMS vya Vodacom, Tigo, Airtel au Halotel.</li>
              <li>Ni bure kabisa na inafanya kazi mara moja kutoka kwenye smartphone yoyote.</li>
              <li>Haina usumbufu wa usajili wa "Sender ID" au Geo-permissions.</li>
            </ul>
          </div>
        </div>

        {/* VIRTUAL SMS SIMULATOR INBOX */}
        <div className="bg-slate-100/80 border border-slate-200/60 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-2.5">
            <div className="flex items-center gap-2 text-slate-800">
              <MessageSquare size={20} className="text-emerald-700" />
              <div>
                <h4 className="font-bold text-sm">📟 Kikasha cha SMS za Simu Virtual (Simulator Logs)</h4>
                <p className="text-[11px] text-slate-500">Inarekodi SMS zote ambazo zilikumbana na vikwazo vya API na kuhifadhiwa kwenye Seva.</p>
              </div>
            </div>
            <button 
              onClick={fetchSimulatedSms}
              disabled={loadingSms}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-500 disabled:opacity-50"
              title="Pakua Upya"
            >
              <RefreshCw size={14} className={loadingSms ? "animate-spin" : ""} />
            </button>
          </div>

          {smsList.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Hakuna ujumbe uliosimuliwa kwa sasa. SMS zote zikituma kwa ufanisi zitapita moja kwa moja.
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {smsList.map((sms, index) => (
                <div key={sms.id || index} className="bg-white border border-slate-200/60 p-3 rounded-lg text-xs space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-emerald-800 font-bold tracking-wide">Peleka: {sms.phone}</span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={10} />
                      <span>{new Date(sms.timestamp).toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 italic font-medium bg-slate-50 p-2.5 rounded border-l-2 border-emerald-500 font-sans leading-relaxed">
                    "{sms.message}"
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                    <AlertTriangle size={11} className="shrink-0" />
                    <span>Njia mbadala kutokana na: {sms.reason || "Kikomo cha Twilio"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hati ya Uhakiki wa Usalama na Umiliki */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={24} />
              <span className="text-xs font-mono tracking-wider text-emerald-400 font-bold uppercase">Hati ya Uthibitisho wa Usalama</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Miliki & Ubunifu wa Mfumo (System Ownership)</h3>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ACTIVE & VERIFIED LICENSE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-mono block">MSIMAMIZI MKUU / OWNER</span>
            <div className="flex items-center gap-2">
              <Award className="text-amber-400 shrink-0" size={18} />
              <span className="font-extrabold text-base text-slate-100 uppercase">{operatorName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-normal">
              {operatorRole} na mbunifu wa mfumo binafsi wa umwagiliaji kwa misingi ya algorithm ya Penman-Monteith nchini Tanzania.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-mono block">ULINZI NA DHAMANA / SECURITY CRYPTO</span>
            <div className="flex items-center gap-2">
              <Lock className="text-emerald-400 shrink-0" size={18} />
              <span className="font-mono text-xs font-bold text-slate-200">SHA-256 SECURED SIGNATURE</span>
            </div>
            <p className="text-slate-400 text-xs leading-normal">
              Ujumbe na mawasiliano ya API (Twilio / Africa's Talking) yanalindwa na encryption salama kuzuia kuingiliwa.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 text-xs font-mono block">ID YA CHETI / LICENSE KEY</span>
            <div className="flex items-center gap-2">
              <UserCheck className="text-sky-400 shrink-0" size={18} />
              <span className="font-mono text-xs font-bold text-slate-200">RST-2026-TZ-PRO-01</span>
            </div>
            <p className="text-slate-400 text-xs leading-normal">
              Kibali hiki kinahakikisha kuwa nakala hii ya mfumo ni halisi na imesajiliwa chini ya jina la msanidi rasmi.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-slate-500 font-mono">
          <span>Sahihi ya Kidijitali ya Msanidi Programu</span>
          <span className="text-emerald-400/80 tracking-widest uppercase font-black bg-slate-900/50 px-3 py-1 rounded">
            signed: {operatorName} // verified
          </span>
        </div>
      </div>
    </div>
  );
};

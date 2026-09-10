"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  UserPlus,
  MapPin,
  Briefcase,
  Sliders,
  CreditCard,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Globe,
  DollarSign,
  Clock,
  Mail,
  User,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function ClientOnboardingPage() {
  const router = useRouter();

  // Multi-step navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Step 1: Company Information
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [taxId, setTaxId] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [industry, setIndustry] = useState("Retail & E-commerce");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Registered Address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");

  // Step 3: Business Operations
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [fiscalYear, setFiscalYear] = useState("January - December");
  const [operatingModel, setOperatingModel] = useState("B2B Enterprise & Direct Merchant");

  // Step 4: Primary Contact
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactJobTitle, setContactJobTitle] = useState("");

  // Step 5: Primary Administrator
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminJobTitle, setAdminJobTitle] = useState("Platform Administrator");

  // Step 6: Commerce Configuration
  const [enableCatalog, setEnableCatalog] = useState(true);
  const [enableInventory, setEnableInventory] = useState(true);
  const [enableOrders, setEnableOrders] = useState(true);
  const [enablePurchasing, setEnablePurchasing] = useState(true);
  const [enableWMS, setEnableWMS] = useState(true);

  // Step 7: Subscription & Commercial
  const [planTier, setPlanTier] = useState("Splinci Commerce OS Enterprise GA");
  const [billingCycle, setBillingCycle] = useState("Annual Enterprise Contract");

  // Modal & API submission state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Auto-fill contact info into admin if empty
  const handleCopyContactToAdmin = () => {
    if (!adminFirstName) setAdminFirstName(contactFirstName);
    if (!adminLastName) setAdminLastName(contactLastName);
    if (!adminEmail) setAdminEmail(contactEmail);
    if (!adminPhone) setAdminPhone(contactPhone);
  };

  // Field validation checks for steps
  const isStep1Valid = legalName.trim() !== "" && displayName.trim() !== "" && companyCode.trim() !== "";
  const isStep5Valid = adminFirstName.trim() !== "" && adminLastName.trim() !== "" && adminEmail.trim().includes("@");

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setError(null);
    setIsLoading(true);

    const fullAddress = [addressLine1, addressLine2, city, stateProvince, postalCode, country]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await fetch("/api/admin/merchants/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          displayName,
          companyCode: companyCode.toUpperCase().trim(),
          taxId: taxId || undefined,
          businessAddress: fullAddress || undefined,
          country,
          currency,
          timezone,
          adminFirstName,
          adminLastName,
          adminEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Merchant client creation or invitation delivery failed.");
      }

      setSuccessData(data.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during client onboarding.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: "Company", icon: Building2 },
    { num: 2, label: "Address", icon: MapPin },
    { num: 3, label: "Business", icon: Globe },
    { num: 4, label: "Contact", icon: User },
    { num: 5, label: "Administrator", icon: UserPlus },
    { num: 6, label: "Commerce", icon: Sliders },
    { num: 7, label: "Subscription", icon: CreditCard },
    { num: 8, label: "Review & Create", icon: ShieldCheck },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Client Onboarding Workspace
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Splinci Platform Operations — Enterprise Merchant Tenant Provisioning &amp; Invitation Dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/merchants"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Client Directory
          </Link>
          <Link
            href="/users"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <User className="w-4 h-4" />
            User Directory
          </Link>
        </div>
      </div>

      {/* Success View */}
      {successData ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-slate-900/90 to-slate-950 p-8 sm:p-12 text-center space-y-6 backdrop-blur-2xl shadow-2xl">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Client Tenant Created Successfully!</h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Enterprise merchant tenant <strong className="text-white">{successData.companyName} ({successData.companyCode})</strong> has been provisioned.
            </p>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 text-xs space-y-3 text-left max-w-lg mx-auto font-mono">
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Company ID:</span>
              <span className="text-slate-200 font-bold">{successData.companyId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Company Code:</span>
              <span className="text-indigo-400 font-bold">{successData.companyCode}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Administrator User:</span>
              <span className="text-slate-200">{successData.adminEmail}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500">Invitation Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> INVITATION SENT
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Account Activation State:</span>
              <span className="text-amber-400 font-bold">AWAITING_MERCHANT_ACTIVATION</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href={`/admin/merchants/${successData.companyId}`}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold text-xs transition-all"
            >
              View Client Profile
            </Link>
            <button
              onClick={() => {
                setSuccessData(null);
                setCurrentStep(1);
                setLegalName("");
                setDisplayName("");
                setCompanyCode("");
                setAdminFirstName("");
                setAdminLastName("");
                setAdminEmail("");
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              + Onboard Another Client
            </button>
            <Link
              href="/admin/merchants"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all"
            >
              Return to Client Directory
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Multi-Step Progress Header */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {stepsHeader.map((s) => {
                const Icon = s.icon;
                const isActive = currentStep === s.num;
                const isComplete = currentStep > s.num;

                return (
                  <button
                    key={s.num}
                    onClick={() => setCurrentStep(s.num)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                        : isComplete
                        ? "bg-slate-950/60 border-slate-800 text-emerald-400"
                        : "bg-slate-950/30 border-slate-850 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-black">0{s.num}</span>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold truncate max-w-full">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3 shadow-lg">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Form Step Cards */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* STEP 01 — COMPANY INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    Step 01 — Company &amp; Legal Identity
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the primary corporate details for the new merchant organization.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Legal Company Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="e.g. Apex Commerce Technologies Ltd."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Display / Trading Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Apex Global Store"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Unique Company Code <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                      placeholder="e.g. APEX_GLOBAL"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Unique identifier used for tenant routing &amp; isolation.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Tax / VAT / GST Number</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="e.g. US99-4820194"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Company Registration Number</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. REG-8849102"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Industry Sector</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Retail & E-commerce">Retail &amp; E-commerce</option>
                      <option value="Consumer Packaged Goods">Consumer Packaged Goods (CPG)</option>
                      <option value="Wholesale & B2B Distribution">Wholesale &amp; B2B Distribution</option>
                      <option value="Manufacturing & Industrial">Manufacturing &amp; Industrial</option>
                      <option value="Apparel & Fashion">Apparel &amp; Fashion</option>
                      <option value="Electronics & Technology">Electronics &amp; Technology</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Corporate Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.apexglobal.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* STEP 02 — REGISTERED ADDRESS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    Step 02 — Registered Headquarters Address
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Provide the official corporate location and mailing address for compliance records.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Address Line 1</label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="100 Enterprise Way, Suite 400"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Address Line 2</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Building B"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">State / Province</label>
                      <input
                        type="text"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="NY"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="10001"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Country <span className="text-rose-400">*</span></label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="US">United States (US)</option>
                      <option value="CA">Canada (CA)</option>
                      <option value="GB">United Kingdom (GB)</option>
                      <option value="AU">Australia (AU)</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="IN">India (IN)</option>
                      <option value="SG">Singapore (SG)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 03 — BUSINESS OPERATIONS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    Step 03 — Business Operations &amp; Regional Defaults
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Set up base operating currency, timezone, and fiscal defaults.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Base Currency <span className="text-rose-400">*</span></label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    >
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                      <option value="GBP">GBP — British Pound (£)</option>
                      <option value="CAD">CAD — Canadian Dollar (C$)</option>
                      <option value="AUD">AUD — Australian Dollar (A$)</option>
                      <option value="INR">INR — Indian Rupee (₹)</option>
                      <option value="SGD">SGD — Singapore Dollar (S$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">System Timezone <span className="text-rose-400">*</span></label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    >
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Fiscal Year Cycle</label>
                    <input
                      type="text"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Operating Model</label>
                  <input
                    type="text"
                    value={operatingModel}
                    onChange={(e) => setOperatingModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 04 — PRIMARY CONTACT */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    Step 04 — Primary Executive Contact
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Contact details for business operations and platform correspondence.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={contactFirstName}
                      onChange={(e) => setContactFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={contactLastName}
                      onChange={(e) => setContactLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="jane.smith@apexglobal.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCopyContactToAdmin}
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Copy Contact Details to Primary Administrator
                  </button>
                </div>
              </div>
            )}

            {/* STEP 05 — PRIMARY ADMINISTRATOR */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    Step 05 — Primary Merchant Administrator Account
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Specify the initial administrator account that will receive the single-use activation invitation.
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-xs flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-extrabold text-amber-100">Splinci Security Policy Notice:</strong>
                    <p className="mt-0.5">
                      This administrator account will be created in an <strong>inactive</strong> state (<code className="text-amber-300">isActive = false</code>).
                      No password is entered or generated here. A single-use activation email will be transmitted directly to the corporate address below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Administrator First Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Administrator Last Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Administrator Corporate Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@apexglobal.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Must be unique across the platform.</p>
                </div>
              </div>
            )}

            {/* STEP 06 — COMMERCE SETUP */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    Step 06 — Commerce Modules &amp; Subsystems Provisioning
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure initial commerce operational subsystems enabled for this tenant.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Product Information Management (PIM)", desc: "Authoring, Variants, AI Attributes", state: enableCatalog, setState: setEnableCatalog },
                    { label: "Inventory Control Hub (WMS)", desc: "Warehouses, Stock Audit, Reservations", state: enableInventory, setState: setEnableInventory },
                    { label: "Sales Order Central (OMS)", desc: "Order Lifecycle, Status Tracking", state: enableOrders, setState: setEnableOrders },
                    { label: "Purchasing & Procurement", desc: "PO Processing, Supplier Management", state: enablePurchasing, setState: setEnablePurchasing },
                  ].map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{m.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={m.state}
                        onChange={(e) => m.setState(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 07 — SUBSCRIPTION */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    Step 07 — Subscription &amp; Commercial Terms
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Specify commercial tier and enterprise SLA entitlement.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Subscription Tier</label>
                    <select
                      value={planTier}
                      onChange={(e) => setPlanTier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Splinci Commerce OS Enterprise GA">Splinci Commerce OS Enterprise GA (Unlimited)</option>
                      <option value="Splinci Standard Merchant">Splinci Standard Merchant</option>
                      <option value="Splinci Pilot Sandbox">Splinci Pilot Sandbox</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Billing Contract</label>
                    <input
                      type="text"
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 08 — REVIEW & FINAL CONFIRMATION */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Step 08 — Pre-Provisioning Review &amp; Onboarding Readiness
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Audit all merchant configuration parameters before final tenant creation.
                  </p>
                </div>

                {/* Readiness Checklist */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Onboarding Readiness Checklist</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      {isStep1Valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                      <span className={isStep1Valid ? "text-slate-200" : "text-amber-300"}>Company Information (Required)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isStep5Valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                      <span className={isStep5Valid ? "text-slate-200" : "text-amber-300"}>Primary Administrator (Required)</span>
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                    <div className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">Merchant Identity</div>
                    <div><span className="text-slate-500">Legal Name:</span> <span className="text-slate-200">{legalName || "N/A"}</span></div>
                    <div><span className="text-slate-500">Display Name:</span> <span className="text-slate-200">{displayName || "N/A"}</span></div>
                    <div><span className="text-slate-500">Company Code:</span> <span className="text-indigo-300 font-bold">{companyCode.toUpperCase() || "N/A"}</span></div>
                    <div><span className="text-slate-500">Country/Currency:</span> <span className="text-slate-200">{country} / {currency}</span></div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                    <div className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">Administrator Account</div>
                    <div><span className="text-slate-500">Name:</span> <span className="text-slate-200">{adminFirstName} {adminLastName}</span></div>
                    <div><span className="text-slate-500">Email:</span> <span className="text-indigo-300">{adminEmail}</span></div>
                    <div><span className="text-slate-500">Account State:</span> <span className="text-amber-400 font-bold">INACTIVE (Awaiting Link)</span></div>
                    <div><span className="text-slate-500">Invitation:</span> <span className="text-emerald-400 font-bold">READY TO SUBMIT</span></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    disabled={!isStep1Valid || !isStep5Valid}
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Create Client &amp; Send Invitation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 8 && (
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 text-xs font-bold transition-all cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Confirm Client Onboarding</h3>
                <p className="text-xs text-slate-400 mt-0.5">Splinci Multi-Tenant Provisioning System</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>Are you sure you want to provision the following merchant client?</p>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 font-mono">
                <div><span className="text-slate-500">Legal Name:</span> <strong className="text-white">{legalName}</strong></div>
                <div><span className="text-slate-500">Company Code:</span> <strong className="text-indigo-400">{companyCode.toUpperCase()}</strong></div>
                <div><span className="text-slate-500">Administrator:</span> <strong className="text-slate-200">{adminEmail}</strong></div>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Merchant tenant will be created in database.</li>
                <li>Administrator user created as <code className="text-amber-300">isActive = false</code>.</li>
                <li>Single-use activation email will be submitted via SMTP.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

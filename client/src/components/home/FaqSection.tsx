import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  Search,
  ExternalLink,
  PhoneCall,
  Building2,
  Headphones,
  Mail,
  Calendar,
} from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: React.ReactNode;
  category:
    | "General"
    | "Filing & Tracking"
    | "Department & Officer"
    | "Appeals & Policy";
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const faqs: FaqItem[] = [
    {
      id: 1,
      category: "Department & Officer",
      question:
        "What are the contact details of the Department of Administrative Reforms and Public Grievances?",
      answer: (
        <div className="space-y-2">
          <p>
            <strong>
              Department of Administrative Reforms and Public Grievances
            </strong>
            , 5th Floor, Sardar Patel Bhavan, Sansad Marg, New Delhi – 110001.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700 pt-1">
            <span className="flex items-center gap-1.5 break-all">
              <Building2 className="w-4 h-4 text-[#2563EB] shrink-0" />
              Website:{" "}
              <a
                href="http://www.darpg.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] font-bold underline inline-flex items-center gap-0.5"
              >
                www.darpg.gov.in <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-[#6F0047] shrink-0" />
              Tele-fax: <strong>23741006</strong>
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      category: "Filing & Tracking",
      question: "Where can the grievances be sent?",
      answer: (
        <div className="space-y-2">
          <p>The grievances can be sent to:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>
              <strong>
                Department of Administrative Reforms and Public Grievances
                (DARPG):
              </strong>{" "}
              <a
                href="http://pgportal.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] font-semibold underline break-all"
              >
                pgportal.gov.in
              </a>
            </li>
            <li>
              <strong>
                Department of Pensions and Pensioners’ Welfare (DP&PW):
              </strong>{" "}
              <a
                href="http://pgportal.gov.in/pension/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] font-semibold underline break-all"
              >
                pgportal.gov.in/pension/
              </a>
            </li>
          </ul>
          <p className="text-slate-600 text-sm pt-1">
            The above nodal agencies receive grievances online through the
            portal as well as by post or by hand in person, from the public.
          </p>
        </div>
      ),
    },
    {
      id: 3,
      category: "Filing & Tracking",
      question: "How do I lodge the grievance?",
      answer: (
        <div className="space-y-2">
          <p>
            Grievances can be lodged online on the portal. In cases where
            internet facility is not available or even otherwise, the citizen is
            free to send her/his grievance by Post. There is no prescribed
            format.
          </p>
          <p>
            The grievance may be written on any plain sheet of paper or on a
            Postcard / Inland letter and addressed to the Department. The
            grievance can also be filed through{" "}
            <strong>Common Service Centre (CSC)</strong> kiosks.
          </p>
        </div>
      ),
    },
    {
      id: 4,
      category: "Filing & Tracking",
      question: "What happens when I lodge the grievance?",
      answer: (
        <p>
          The grievance is acknowledged online or by post. A{" "}
          <strong>unique registration number</strong> is generated and assigned
          to each grievance for subsequent monitoring and communications.
        </p>
      ),
    },
    {
      id: 5,
      category: "Filing & Tracking",
      question: "How do I track my grievance?",
      answer: (
        <p>
          It may be tracked on the portal at any time by using the{" "}
          <strong>‘View Status’</strong> / <strong>‘Track Grievance’</strong>{" "}
          link and entering the unique registration number.
        </p>
      ),
    },
    {
      id: 6,
      category: "Department & Officer",
      question:
        "What happens to the grievances? How are the grievances dealt with in Central Ministries/Departments?",
      answer: (
        <p>
          Every Central Ministry / Department has designated a Joint Secretary
          or a Director / Deputy Secretary as its{" "}
          <strong>‘Director of Grievances’</strong>. He / She is the statutory
          nodal officer for redress of grievances on work areas allocated to
          that particular Ministry / Department.
        </p>
      ),
    },
    {
      id: 7,
      category: "Filing & Tracking",
      question:
        "After redress, can the grievance be re-opened for further correspondence about it having been closed without details etc.?",
      answer: (
        <p>
          <strong>No.</strong> In such situations, the citizen will have to
          lodge a fresh grievance drawing reference to the closed grievance and
          call for details. Sometimes, the details are sent by post and
          mentioned in the final report. The postal delivery may be awaited
          before lodging a fresh grievance.
        </p>
      ),
    },
    {
      id: 8,
      category: "Department & Officer",
      question:
        "What are the contact details of the Nodal Officers of Public Grievances in Ministries/Departments?",
      answer: (
        <p>
          The list of Nodal Grievance Officers is accessible directly on the
          Department’s portal. In addition, it is also published in the
          Citizen’s Charter of respective Ministries/Departments hosted on their
          official websites.
        </p>
      ),
    },
    {
      id: 9,
      category: "Department & Officer",
      question:
        "What is the system of granting personal hearing on grievances?",
      answer: (
        <p>
          <strong>Every Wednesday</strong> of the week has been earmarked for
          receiving and hearing of grievances by the Director of Public
          Grievances in person across Central Ministries and Departments.
        </p>
      ),
    },
    {
      id: 10,
      category: "General",
      question:
        "What are the types of grievances which are not taken up for redress by the Department?",
      answer: (
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>
            Subjudice cases or any matter concerning judgment given by any court
            of law.
          </li>
          <li>Personal and family disputes.</li>
          <li>RTI matters (must be filed under RTI Act, 2005 channels).</li>
          <li>
            Anything that impacts upon territorial integrity of the country or
            friendly relations with foreign countries.
          </li>
        </ul>
      ),
    },
    {
      id: 11,
      category: "Appeals & Policy",
      question:
        "What is the role of Department of Administrative Reforms and Public Grievances (DARPG) concerning Central Ministries/Departments/Organizations?",
      answer: (
        <p>
          DARPG is the chief policy-making, monitoring, and coordinating
          Department for public grievances arising from the work of
          Ministries/Departments/Organizations of the Government of India.
          Grievances received in the department are forwarded to the
          Ministries/Departments concerned, where redressal is performed in a
          decentralized manner. The Department periodically reviews pendency for
          speedy disposal.
        </p>
      ),
    },
    {
      id: 12,
      category: "Appeals & Policy",
      question:
        "What is the role of Department of Administrative Reforms and Public Grievances (DARPG) concerning State Governments?",
      answer: (
        <p>
          All grievances relating to State Governments / Union Territory
          Administrations and Government of NCT Region of Delhi are forwarded
          directly to the State/UT/NCT Government concerned. Citizens may also
          take up matters regarding pendency directly with the respective State
          Government authorities.
        </p>
      ),
    },
    {
      id: 13,
      category: "General",
      question: "What is the time limit for redress of grievance?",
      answer: (
        <p>
          The statutory timeline is <strong>21 calendar days</strong>. In case
          of unavoidable delay, an interim reply explaining the reasons for
          delay is required to be provided to the citizen.
        </p>
      ),
    },
    {
      id: 14,
      category: "Appeals & Policy",
      question:
        "What action can be taken by me in case of non-redress of my grievance within the prescribed time?",
      answer: (
        <p>
          You may take up the matter directly with the designated{" "}
          <strong>Director of Public Grievances</strong> of the concerned
          Ministry/Department whose contact directory is published on the
          portal.
        </p>
      ),
    },
    {
      id: 15,
      category: "Appeals & Policy",
      question:
        "What can a citizen do if he/she is not satisfied with the redressal of the grievance?",
      answer: (
        <p>
          An <strong>Appeal provision</strong> is established for redressal of
          dissatisfied grievances. Upon disposal by the Nodal Officer, the
          citizen provides a mandatory feedback rating. If the rating is{" "}
          <em>‘Poor’</em>, the option to file a statutory First Appeal is
          enabled. The appeal must be filed within <strong>30 days</strong> of
          disposal.
        </p>
      ),
    },
    {
      id: 16,
      category: "General",
      question: "How to deactivate CPGRAMS account?",
      answer: (
        <div className="space-y-2">
          <ol className="list-decimal pl-5 space-y-1 text-slate-700">
            <li>
              The request for deactivation of a user account must be made
              through email to the CPGRAMS helpdesk (
              <span className="font-mono text-[#2563EB] font-bold break-all">
                cpgrams-darpg[at]nic[dot]in
              </span>
              ). The email must be sent from the registered email ID only.
            </li>
            <li>
              In case of deactivation, the user cannot create a new account with
              the same email-id/mobile, but the user can make a request again to
              reactivate the same account.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 17,
      category: "Department & Officer",
      question:
        "How to change the details of the Nodal Grievance Officer and Nodal Appellate Authority in the portal?",
      answer: (
        <p>
          The concerned organisation (Ministries / Department / State
          Government) can update the nodal officer and appellate authority
          credentials directly through their official administrative login
          credentials.
        </p>
      ),
    },
    {
      id: 18,
      category: "Appeals & Policy",
      question: "Whether the Department has operated any feedback call centre?",
      answer: (
        <p>
          <strong>Yes.</strong> The Department has established a dedicated{" "}
          <strong>Feedback Call Centre</strong> to reach out to citizens on
          disposed grievances when feedback is not submitted online. The call
          centre also assists citizens in registering appeals where resolution
          has been unsatisfactory.
        </p>
      ),
    },
  ];

  const categories = [
    "All",
    "General",
    "Filing & Tracking",
    "Department & Officer",
    "Appeals & Policy",
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.answer === "string" &&
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      id="faq"
      className="py-14 sm:py-20 bg-white border-b border-slate-200 text-slate-900 w-full max-w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 text-left w-full max-w-full">
        {/* ================= SECTION HEADER ================= */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#6F0047]/10 border border-[#6F0047]/20 text-[11px] sm:text-xs font-bold text-[#6F0047] uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540] tracking-tight leading-tight break-words">
            Frequently Asked Questions on Grievance Redress Mechanism
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl">
            Detailed guidance on the Public Grievance Redress Mechanism in the
            Government of India and the role of the Department of Administrative
            Reforms and Public Grievances (DARPG), New Delhi.
          </p>
        </div>

        {/* ================= SEARCH & CATEGORY FILTER BAR ================= */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2 w-full max-w-full">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., 21 days, appeal)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white text-slate-900"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#0A2540] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ================= CLEAN DIVIDER-BASED FAQ LIST WITH SMOOTH ACCORDION ================= */}
        <div className="divide-y divide-slate-200 border-t border-b border-slate-200 w-full max-w-full">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No matching questions found for &ldquo;{searchQuery}&rdquo;. Try
              another search term or reset category filters.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIndex === faq.id;
              return (
                <div
                  key={faq.id}
                  className="transition-colors hover:bg-slate-50/40 w-full max-w-full"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : faq.id)}
                    className="w-full py-4 sm:py-5 text-left flex items-start justify-between gap-3 sm:gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3.5 pr-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-50 text-[#2563EB] font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                        {faq.id}
                      </span>
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-[#0A2540] leading-snug break-words">
                        {faq.question}
                      </span>
                    </div>
                    <div
                      className={`p-1 rounded-full transition-transform duration-300 ease-out shrink-0 mt-0.5 ${
                        isOpen
                          ? "rotate-180 bg-blue-50 text-[#2563EB]"
                          : "text-slate-400"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </button>

                  {/* Smooth Animated Height Accordion Container */}
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-1 pb-5 text-xs sm:text-sm lg:text-base text-slate-700 leading-relaxed pl-0 sm:pl-9 break-words">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= RESTRUCTURED CITIZEN ASSISTANCE HUB ================= */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-6 w-full max-w-full text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-200">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-[#0A2540] tracking-tight">
                  Still have questions or need assistance?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Our dedicated National Public Grievance Helpdesk is
                  operational 24x7 with multi-channel support.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Helpdesk Active 24x7</span>
            </div>
          </div>

          {/* 3 Interactive Assistance Channel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Channel 1: Toll Free */}
            <a
              href="tel:1800114000"
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#2563EB] group-hover:underline">
                  Call Now &rarr;
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Toll-Free Helpline
                </span>
                <strong className="text-base sm:text-lg font-extrabold text-[#0A2540] font-mono">
                  1800-11-4000
                </strong>
              </div>
            </a>

            {/* Channel 2: Email Helpdesk */}
            <a
              href="mailto:cpgrams-darpg@nic.in"
              className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all group flex flex-col justify-between space-y-3 cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#6F0047]/10 text-[#6F0047] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#6F0047] group-hover:underline">
                  Send Email &rarr;
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Official Helpdesk
                </span>
                <strong className="text-xs sm:text-sm font-bold text-[#0A2540] break-all">
                  cpgrams-darpg@nic.in
                </strong>
              </div>
            </a>

            {/* Channel 3: Personal Hearing */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  In-Person
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Wednesday Hearing
                </span>
                <strong className="text-xs sm:text-sm font-bold text-[#0A2540]">
                  Every Wednesday 10 AM–1 PM
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

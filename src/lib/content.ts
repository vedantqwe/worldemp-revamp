/**
 * Hand-authored copy for the designed sections - the homepage, the section
 * mastheads and the navigation.
 *
 * Every string is the real copy from worldemp.com: the `en` set from the
 * English edition, the `nl` set from the Dutch one, which is the live site's
 * primary language. Long-form content (articles, cases, role and service
 * pages) is not here - that is scraped into src/content by tools/scraper and
 * read through src/lib/pages.ts.
 *
 * Keeping it in one typed module means the revamp can be re-skinned without
 * touching wording, and copy can be edited without going near React.
 */
import type { Locale } from "./i18n";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; blurb?: string }[];
};

export type Specialisation = {
  id: string;
  name: string;
  body: string;
  roles: string[];
};

export type SiteContent = {
  site: {
    name: string;
    tagline: string;
    mission: string;
    phone: string;
    phoneHref: string;
    email: string;
  };
  nav: NavItem[];
  hero: {
    eyebrow: string;
    heading: string;
    body: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    stats: { value: string; unit: string; label: string }[];
  };
  allInConcept: {
    heading: string;
    cta: { label: string; href: string };
    pillars: { title: string; body: string }[];
  };
  timeline: {
    heading: string;
    body: string;
    steps: { week: string; title: string; body: string }[];
    ctas: { label: string; href: string }[];
  };
  specialisationsIntro: { eyebrow: string; heading: string };
  specialisations: Specialisation[];
  founderQuote: { quote: string; name: string; role: string };
  costs: { heading: string; body: string };
  allInRate: { heading: string; body: string; includes: string[] };
  comparison: {
    heading: string;
    columns: { worldemp: string; traditional: string };
    rows: { point: string; worldemp: string; traditional: string }[];
  };
  testimonialsIntro: { eyebrow: string; heading: string };
  testimonials: { quote: string; name: string; role: string }[];
  clients: string[];
  services: { id: string; name: string; body: string }[];
  /** Small labels that live in the designed sections rather than in content. */
  labels: {
    allInConceptEyebrow: string;
    marquee: string;
    clientsLabel: string;
    propositionEyebrow: string;
  };
  ctaBand: {
    heading: string;
    body: string;
    primary: string;
  };
  footer: {
    blurb: string;
    followUs: string;
    privacy: string;
    sitemap: string;
    rights: string;
  };
  mastheads: Record<string, { eyebrow: string; title: string; intro: string }>;
  /** Copy that belongs to one page only. */
  pages: {
    contact: {
      asideHeading: string;
      asideBody: string;
      facts: { term: string; detail: string }[];
    };
    privacy: { eyebrow: string; title: string; placeholder: string };
    sitemap: { eyebrow: string; title: string };
    about: {
      valuesHeading: string;
      values: { title: string; body: string }[];
      faqHeading: string;
      faqs: { q: string; a: string }[];
    };
    form: {
      legend: string;
      name: string;
      namePlaceholder: string;
      company: string;
      companyPlaceholder: string;
      email: string;
      phone: string;
      discipline: string;
      disciplines: string[];
      message: string;
      messagePlaceholder: string;
      submit: string;
      submitting: string;
      successHeading: string;
      successBody: string;
      successFallback: string;
      errors: { name: string; emailMissing: string; emailInvalid: string; message: string };
      optional: string;
    };
  };
};

const en: SiteContent = {
  site: {
    name: "WorldEmp",
    tagline: "Highly educated remote staff",
    mission:
      "WorldEmp connects knowledge, labour capacity and demand - digitally and globally.",
    phone: "+31 (0)88 - 400 29 00",
    phoneHref: "tel:+310884002900",
    email: "info@worldemp.com",
  },
  nav: [
    {
      label: "Services",
      href: "/services",
      children: [
        {
          label: "Digital knowledge migrant",
          href: "/services/digital-knowledge-migrant",
          blurb: "Global specialists, working remotely as part of your team",
        },
        {
          label: "Outsourcing",
          href: "/services/outsourcing",
          blurb: "Hand over a function end to end",
        },
        {
          label: "Secondment",
          href: "/services/secondment",
          blurb: "Contract staffing for a fixed engagement",
        },
        {
          label: "Recruitment",
          href: "/services/recruitment",
          blurb: "Search and selection with no placement fee",
        },
        {
          label: "Applicant Tracking System",
          href: "/services/applicant-tracking-system",
          blurb: "Run your own pipeline on our platform",
        },
      ],
    },
    {
      label: "Sectors",
      href: "/sectors",
      children: [
        {
          label: "Energy transition",
          href: "/sectors/energy-transition",
          blurb: "Grid, offshore wind and the capacity it needs",
        },
        {
          label: "Semiconductor industry",
          href: "/sectors/semiconductor-industry",
          blurb: "Scaling teams as fast as the fabs",
        },
      ],
    },
    {
      label: "Solutions",
      href: "/solutions",
      children: [
        { label: "IT", href: "/solutions/it" },
        { label: "Data", href: "/solutions/data" },
        { label: "Finance", href: "/solutions/finance" },
        { label: "Engineering", href: "/solutions/engineering" },
      ],
    },
    { label: "Method", href: "/method" },
    {
      label: "About",
      href: "/about",
      children: [
        { label: "The company", href: "/about/the-company" },
        { label: "Team", href: "/about/team" },
        { label: "Mission and core values", href: "/about/mission-and-core-values" },
        { label: "Corporate social responsibility", href: "/about/corporate-social-responsibility" },
        { label: "Compliance", href: "/about/compliance" },
        { label: "Client stories", href: "/cases" },
        { label: "Knowledge base", href: "/insights" },
        { label: "FAQ", href: "/about/frequently-asked-questions" },
      ],
    },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    eyebrow: "20+ years of international recruitment",
    heading: "Access all the talent in the world!",
    body:
      "Recruit highly skilled professionals worldwide who fit perfectly within your company culture. Discover the growth opportunities for your business here.",
    primaryCta: { label: "Learn more about WorldEmp", href: "/about" },
    secondaryCta: { label: "Schedule a meeting", href: "/contact" },
    stats: [
      { value: "2-6", unit: "weeks", label: "to a new colleague" },
      { value: "40-70", unit: "%", label: "lower labour costs" },
      { value: "0", unit: "", label: "recruitment fees" },
      { value: "20", unit: "+ yrs", label: "of experience" },
    ],
  },
  allInConcept: {
    heading: "The WorldEmp all-in concept consists of:",
    cta: { label: "Discover the benefits", href: "/method" },
    pillars: [
      { title: "Research", body: "Market analysis on how quickly your vacancy can be filled" },
      {
        title: "Recruitment & selection",
        body: "After comprehensive selection, we quickly introduce multiple candidates",
      },
      { title: "Support", body: "Complete HR support and performance management" },
      {
        title: "Workspace in a high-tech environment",
        body: "We ensure that your colleagues have a fantastic workspace",
      },
      {
        title: "Upskilling and social activities",
        body: "Fun events and further development for your colleagues",
      },
    ],
  },
  timeline: {
    heading: "New colleague in 2 to 6 weeks",
    body:
      "From intake to a signed contract, the WorldEmp method runs on a fixed rhythm. You see candidates in week two, and billing starts only when someone actually starts with you.",
    steps: [
      {
        week: "Week 1",
        title: "Intake and research",
        body: "We map the role and run a market analysis on how quickly it can be filled.",
      },
      {
        week: "Week 2",
        title: "Shortlist",
        body: "Multiple pre-screened candidates, assessed on culture and on craft.",
      },
      {
        week: "Week 3-4",
        title: "Interviews and testing",
        body: "Cultural and technical international tests, run by us and reviewed by you.",
      },
      {
        week: "Week 5-6",
        title: "Onboarding",
        body: "Workplace, equipment and HR support arranged before day one.",
      },
    ],
    ctas: [
      { label: "Demo working method", href: "/method" },
      { label: "I want advice", href: "/contact" },
    ],
  },
  specialisationsIntro: {
    eyebrow: "Solutions",
    heading: "Which specialization is relevant for my company?",
  },
  specialisations: [
    {
      id: "engineering",
      name: "Engineering",
      body:
        "In the dynamic and technically complex world of engineering, it's essential to have access to specialized experts who can assist your company in designing, developing, and managing advanced projects and systems.",
      roles: [
        "Automation engineer",
        "BIM modeler",
        "Chemical engineer",
        "Civil engineer",
        "Document controller",
        "Electrical engineer",
        "Fire safety engineer",
        "Maritime engineer",
        "Mechanical engineer",
        "Process engineer",
        "Project manager",
        "Structural engineer",
        "Naval architect",
      ],
    },
    {
      id: "data",
      name: "Data",
      body:
        "In the era of big data and advanced analytics, access to specialized data experts is essential for any business striving for data-driven decision-making.",
      roles: [
        "Big data specialist",
        "Data scientist",
        "Data engineer",
        "Master data management specialist",
      ],
    },
    {
      id: "it",
      name: "IT",
      body:
        "In the rapidly changing world of information technology, finding the right IT specialists is crucial for the success of your business.",
      roles: [
        "Application developer",
        "Application manager",
        "AI specialist",
        "Cloud & DevOps engineer",
        "Cybersecurity specialist",
        "Database administrator",
        "Test engineer",
        "UI & UX designer",
      ],
    },
    {
      id: "finance",
      name: "Finance",
      body:
        "In a complex and rapidly changing financial world, it's crucial to have access to specialized financial experts who can help navigate the nuances of financial management and regulations.",
      roles: [
        "Bookkeeper / Accountant",
        "Compliance specialist",
        "Cryptocurrency / blockchain expert",
        "Financial planning expert",
        "Fintech expert",
        "Insurance expert",
        "Risk management expert",
        "Tax specialist",
      ],
    },
  ],
  founderQuote: {
    quote: "Always surround yourself with people who are smarter than you.",
    name: "Frank Korf",
    role: "CEO & Founder",
  },
  costs: {
    heading: "Free recruitment and 40-70% lower labour costs",
    body:
      "By working with professionals through the WorldEmp method, we are confident that your labour costs will decrease by 40-70%.",
  },
  allInRate: {
    heading: "The WorldEmp rate is all-in",
    body:
      "Within our concept, we work with an all-in rate without surprises afterward or ultra-small print. Everything is included in our rate, and billing starts only when an employee actually starts with you.",
    includes: [
      "Recruitment",
      "Talent assessment",
      "Cultural and technical international tests",
      "A workplace in the WorldEmp office",
      "Performance management of the employee",
      "Daily use of the virtual working environment",
      "Any outings we organise for your employees",
    ],
  },
  comparison: {
    heading: "WorldEmp versus traditional hiring",
    columns: { worldemp: "WorldEmp", traditional: "Traditional HR" },
    rows: [
      {
        point: "International network",
        worldemp: "Access to talent pools across the globe",
        traditional: "Limited to the local labour market",
      },
      {
        point: "No recruitment costs",
        worldemp: "Search and selection included in the rate",
        traditional: "A one-off placement fee per hire",
      },
      {
        point: "Compliance and no risk",
        worldemp: "Employment, payroll and compliance handled by us",
        traditional: "Your legal entity carries the risk",
      },
      {
        point: "Increased productivity",
        worldemp: "Performance management and upskilling included",
        traditional: "Managed entirely in-house",
      },
    ],
  },
  testimonialsIntro: { eyebrow: "Client stories", heading: "What clients say about us" },
  testimonials: [
    {
      quote:
        "The collaboration with WorldEmp has been positively surprising for Bluedesk. We were looking for an experienced .Net developer who could be quickly deployed.",
      name: "Barry Tempelaar",
      role: "CEO, Bluedesk",
    },
    {
      quote:
        "WorldEmp has a very thorough selection process, aimed at bridging cultural differences.",
      name: "Steven Hummel",
      role: "Manager Engineering, Innovatec",
    },
    {
      quote:
        "As your company grows, it's beneficial for the workforce to be able to flexibly grow along with it.",
      name: "Angelique van Grinsven",
      role: "CEO, Bluetrace",
    },
    {
      quote:
        "As a highly technological IT company specialized in e-commerce, myShop is always on the lookout for well-educated professionals.",
      name: "John Zanoni",
      role: "CTO, myShop",
    },
    {
      quote:
        "As a high-tech company focused on utilizing big data and analytics to assist businesses with their agile transformation, we rely on talent that masters their craft.",
      name: "Peter Storm",
      role: "CEO, Data2Performance",
    },
  ],
  clients: [
    "Bluedesk",
    "Bluetrace",
    "Data2Performance",
    "Innovatec",
    "myShop",
    "Saman Groep",
    "Van Lent",
    "Basisonline",
    "BloomyPro",
    "Dilax",
    "HI Systems",
    "Intures",
    "IT Synergy",
    "KUBO",
  ],
  services: [
    {
      id: "digital-knowledge-migrant",
      name: "Digital knowledge migrant",
      body:
        "A highly educated specialist who works for you full time from the WorldEmp office, fully embedded in your team and your tooling - without relocation.",
    },
    {
      id: "outsourcing",
      name: "Outsourcing",
      body:
        "Hand over an entire function or process. We staff it, manage it and report on it, so you buy an outcome rather than a headcount.",
    },
    {
      id: "secondment",
      name: "Secondment",
      body:
        "Contract staffing for a defined engagement, with the employment, payroll and compliance carried by us.",
    },
    {
      id: "recruitment",
      name: "Recruitment",
      body:
        "Search and selection across our international network, with complete assessments and no placement fee.",
    },
    {
      id: "applicant-tracking-system",
      name: "Applicant Tracking System",
      body:
        "Run your own hiring pipeline on the WorldEmp platform, with the same assessment tooling our recruiters use.",
    },
  ],
  labels: {
    allInConceptEyebrow: "The all-in concept",
    marquee: "Trusted by teams across the Netherlands and beyond",
    clientsLabel: "Clients",
    propositionEyebrow: "The proposition",
  },
  ctaBand: {
    heading: "Your next colleague is already out there.",
    body:
      "Tell us the role. We will come back with a market analysis and a shortlist, and you pay nothing until someone starts.",
    primary: "Schedule a meeting",
  },
  footer: {
    blurb: "WorldEmp connects knowledge, labour capacity and demand, digitally and globally.",
    followUs: "Follow us on",
    privacy: "Privacy & cookie statement",
    sitemap: "Sitemap",
    rights: "All rights reserved.",
  },
  pages: {
    contact: {
      asideHeading: "Rather talk it through?",
      asideBody:
        "A fifteen-minute call is usually enough for us to tell you whether the role is realistic, and how long it is likely to take.",
      facts: [
        { term: "Response time", detail: "Within one working day" },
        { term: "Shortlist", detail: "Typically week two" },
        { term: "Cost to enquire", detail: "None - billing starts when someone starts" },
      ],
    },
    privacy: {
      eyebrow: "Legal",
      title: "Privacy & cookie statement",
      placeholder:
        "This page is a placeholder. The approved privacy and cookie statement still needs to be migrated from the current site before launch.",
    },
    sitemap: { eyebrow: "Sitemap", title: "Everything on this site" },
    about: {
      valuesHeading: "Mission and core values",
      values: [
        {
          title: "Human first",
          body: "Every placement is a person joining a team, not a line on an invoice. Cultural fit is assessed as seriously as technical skill.",
        },
        {
          title: "No hidden economics",
          body: "One all-in rate. No placement fee, no margin buried in the small print, and no billing before someone starts.",
        },
        {
          title: "Genuinely global",
          body: "Twenty years of building talent pools outside the local market, so a scarce role is a search problem rather than a dead end.",
        },
        {
          title: "Accountable after day one",
          body: "Performance management, upskilling and HR support continue for as long as the colleague works with you.",
        },
      ],
      faqHeading: "Frequently asked questions",
      faqs: [
        {
          q: "How quickly can someone start?",
          a: "Two to six weeks from intake, depending on the scarcity of the role. You see a shortlist in week two.",
        },
        {
          q: "What does the all-in rate include?",
          a: "Recruitment, talent assessment, cultural and technical testing, a workplace in the WorldEmp office, performance management, the virtual working environment, and team outings.",
        },
        {
          q: "Do we pay a placement fee?",
          a: "No. Recruitment is included, and billing begins only when an employee actually starts with you.",
        },
        {
          q: "Who employs the colleague?",
          a: "We do. Employment, payroll and compliance sit with WorldEmp, so your entity does not carry that risk.",
        },
      ],
    },
    form: {
      legend: "Tell us the role",
      name: "Name",
      namePlaceholder: "Your name",
      company: "Company",
      companyPlaceholder: "Company name",
      email: "Email",
      phone: "Phone",
      discipline: "Discipline",
      disciplines: ["IT", "Data", "Finance", "Engineering", "Something else"],
      message: "Message",
      messagePlaceholder: "Tell us about the role, the team and the timeline.",
      submit: "Send request",
      submitting: "Sending...",
      successHeading: "Your message is ready to send",
      successBody: "We have opened it in your email app, addressed to WorldEmp. Send it and you have a reply within one working day, usually with a first read on how quickly the role can be filled.",
      successFallback: "Nothing opened? Send it to us directly:",
      errors: {
        name: "Please tell us your name.",
        emailMissing: "We need an email address to reply to.",
        emailInvalid: "That address looks incomplete.",
        message: "A sentence or two about the role helps us reply properly.",
      },
      optional: "optional",
    },
  },
  mastheads: {
    services: {
      eyebrow: "Services",
      title: "Five ways to add the people you need",
      intro:
        "From one remote specialist to an outsourced function - the same recruitment, assessment and support sit behind each of them.",
    },
    sectors: {
      eyebrow: "Sectors",
      title: "The industries we staff",
      intro:
        "We understand the unique needs of each sector, and match companies with the professionals those needs call for.",
    },
    solutions: {
      eyebrow: "Solutions",
      title: "Specialists across four disciplines",
      intro:
        "Open a discipline to see the roles we recruit for. If the role you need is not listed, it usually still sits inside our network - ask.",
    },
    method: {
      eyebrow: "Method",
      title: "How a new colleague reaches your team",
      intro:
        "A fixed rhythm from intake to onboarding, with everything that surrounds it - housing, culture, management - handled by us.",
    },
    about: {
      eyebrow: "About us",
      title: "Knowledge, capacity and demand - connected",
      intro:
        "Twenty years of international recruitment, an office network across two continents, and a way of working built for remote teams.",
    },
    insights: {
      eyebrow: "Knowledge base",
      title: "What we are reading, writing and learning",
      intro:
        "Research, expert interviews and field notes on international recruitment, remote teams and the industries we staff.",
    },
    cases: {
      eyebrow: "Client stories",
      title: "What the method looks like in practice",
      intro: "Companies who added colleagues through WorldEmp, in their own words.",
    },
    contact: {
      eyebrow: "Contact",
      title: "How can we help you?",
      intro:
        "Questions about our services, or want more information? Use the form and our team will get back to you, or reach us directly by email or telephone.",
    },
  },
};

const nl: SiteContent = {
  site: {
    name: "WorldEmp",
    tagline: "Hoogopgeleid personeel op afstand",
    mission:
      "WorldEmp verbindt kennis, arbeidscapaciteit en vraag - digitaal en wereldwijd.",
    phone: "+31 (0)88 - 400 29 00",
    phoneHref: "tel:+310884002900",
    email: "info@worldemp.com",
  },
  nav: [
    {
      label: "Diensten",
      href: "/services",
      children: [
        {
          label: "Digitale kennismigrant",
          href: "/services/digital-knowledge-migrant",
          blurb: "Wereldwijde specialisten, op afstand onderdeel van jouw team",
        },
        {
          label: "Outsourcing",
          href: "/services/outsourcing",
          blurb: "Draag een functie volledig over",
        },
        {
          label: "Detachering",
          href: "/services/secondment",
          blurb: "Tijdelijke inzet voor een afgebakende opdracht",
        },
        {
          label: "Recruitment",
          href: "/services/recruitment",
          blurb: "Werving en selectie zonder bemiddelingskosten",
        },
        {
          label: "Applicant tracking system",
          href: "/services/applicant-tracking-system",
          blurb: "Beheer je eigen pijplijn op ons platform",
        },
      ],
    },
    {
      label: "Sectoren",
      href: "/sectors",
      children: [
        {
          label: "Energietransitie",
          href: "/sectors/energy-transition",
          blurb: "Net, offshore wind en de capaciteit die dat vraagt",
        },
        {
          label: "Semiconductor-industrie",
          href: "/sectors/semiconductor-industry",
          blurb: "Teams laten meegroeien met de fabs",
        },
      ],
    },
    {
      label: "Oplossingen",
      href: "/solutions",
      children: [
        { label: "IT", href: "/solutions/it" },
        { label: "Data", href: "/solutions/data" },
        { label: "Finance", href: "/solutions/finance" },
        { label: "Engineering", href: "/solutions/engineering" },
      ],
    },
    { label: "Werkwijze", href: "/method" },
    {
      label: "Over ons",
      href: "/about",
      children: [
        { label: "Het bedrijf", href: "/about/the-company" },
        { label: "Team", href: "/about/team" },
        { label: "Missie en kernwaarden", href: "/about/mission-and-core-values" },
        { label: "MVO", href: "/about/corporate-social-responsibility" },
        { label: "Compliance", href: "/about/compliance" },
        { label: "Klantverhalen", href: "/cases" },
        { label: "Kennisbank", href: "/insights" },
        { label: "Veelgestelde vragen", href: "/about/frequently-asked-questions" },
      ],
    },
    { label: "Contact", href: "/contact" },
  ],
  hero: {
    eyebrow: "20+ jaar internationale werving",
    heading: "Krijg toegang tot al het talent in de wereld!",
    body:
      "Werf wereldwijd hoogopgeleide professionals die perfect binnen jouw bedrijfscultuur passen. Ontdek hier de groeimogelijkheden voor jouw bedrijf.",
    primaryCta: { label: "Meer over WorldEmp", href: "/about" },
    secondaryCta: { label: "Plan een afspraak", href: "/contact" },
    stats: [
      { value: "2-6", unit: "weken", label: "tot een nieuwe collega" },
      { value: "40-70", unit: "%", label: "lagere arbeidskosten" },
      { value: "0", unit: "", label: "bemiddelingskosten" },
      { value: "20", unit: "+ jaar", label: "ervaring" },
    ],
  },
  allInConcept: {
    heading: "Het WorldEmp all-in concept bestaat uit:",
    cta: { label: "Ontdek de voordelen", href: "/method" },
    pillars: [
      {
        title: "Research",
        body: "Marktanalyse hoe snel jouw vacature kan worden ingevuld",
      },
      {
        title: "Recruitment & selectie",
        body: "Na een uitgebreide selectie stellen wij snel meerdere kandidaten voor",
      },
      {
        title: "Ondersteuning",
        body: "Volledige HR-ondersteuning en prestatiemanagement",
      },
      {
        title: "Werkplek in high-tech omgeving",
        body: "We zorgen ervoor dat jouw collega's een fantastische werkplek hebben",
      },
      {
        title: "Upskilling en sociale activiteiten",
        body: "Leuke events en doorontwikkelen van jouw collega",
      },
    ],
  },
  timeline: {
    heading: "Nieuwe collega in 2 tot 6 weken",
    body:
      "Van intake tot getekend contract volgt de WorldEmp-methode een vast ritme. In week twee zie je kandidaten, en de facturatie start pas zodra er daadwerkelijk iemand bij je begint.",
    steps: [
      {
        week: "Week 1",
        title: "Intake en research",
        body: "We brengen de rol in kaart en analyseren hoe snel die in te vullen is.",
      },
      {
        week: "Week 2",
        title: "Shortlist",
        body: "Meerdere voorgeselecteerde kandidaten, getoetst op cultuur en vakmanschap.",
      },
      {
        week: "Week 3-4",
        title: "Gesprekken en testen",
        body: "Culturele en technisch internationale testen, door ons uitgevoerd en door jou beoordeeld.",
      },
      {
        week: "Week 5-6",
        title: "Onboarding",
        body: "Werkplek, apparatuur en HR-ondersteuning geregeld vóór dag één.",
      },
    ],
    ctas: [
      { label: "Demo werkwijze", href: "/method" },
      { label: "Ik wil advies", href: "/contact" },
    ],
  },
  specialisationsIntro: {
    eyebrow: "Oplossingen",
    heading: "Welke specialisatie is voor mijn bedrijf relevant?",
  },
  specialisations: [
    {
      id: "engineering",
      name: "Engineering",
      body:
        "In de dynamische en technisch complexe wereld van engineering is het essentieel om toegang te hebben tot gespecialiseerde experts die jouw bedrijf helpen bij het ontwerpen, ontwikkelen en beheren van geavanceerde projecten en systemen.",
      roles: [
        "Automation engineer",
        "BIM modelleur",
        "Chemisch ingenieur",
        "Civiel ingenieur",
        "Document controller",
        "Elektrotechnisch ingenieur",
        "Brandveiligheid ingenieur",
        "Maritiem ingenieur",
        "Werktuigbouwkundig ingenieur",
        "Procesingenieur",
        "Projectmanager",
        "Constructief ingenieur",
        "Scheepsarchitect",
      ],
    },
    {
      id: "data",
      name: "Data",
      body:
        "In het tijdperk van big data en geavanceerde analytics is toegang tot gespecialiseerde data-experts essentieel voor elk bedrijf dat streeft naar datagedreven besluitvorming.",
      roles: [
        "Big data specialist",
        "Data scientist",
        "Data engineer",
        "Master data management specialist",
      ],
    },
    {
      id: "it",
      name: "IT",
      body:
        "In de snel evoluerende wereld van de informatietechnologie is het vinden van de juiste IT-specialisten cruciaal voor het succes van jouw bedrijf.",
      roles: [
        "Applicatie ontwikkelaar",
        "Applicatiebeheerder",
        "AI specialist",
        "Cloud & DevOps engineer",
        "Cybersecurity specialist",
        "Database administrator",
        "Test engineer",
        "UI & UX designer",
      ],
    },
    {
      id: "finance",
      name: "Finance",
      body:
        "In een complexe en snel veranderende financiële wereld is het cruciaal om toegang te hebben tot gespecialiseerde financiële experts die kunnen helpen bij het navigeren door financieel beheer en regelgeving.",
      roles: [
        "Boekhouder / accountant",
        "Compliance specialist",
        "Cryptocurrency / blockchain expert",
        "Financiële planning",
        "Fintech expert",
        "Verzekeringsdeskundige",
        "Risicomanagement expert",
        "Belastingspecialist",
      ],
    },
  ],
  founderQuote: {
    quote: "Verzamel altijd mensen om je heen die slimmer zijn dan jijzelf.",
    name: "Frank Korf",
    role: "CEO & Founder",
  },
  costs: {
    heading: "Gratis werving en 40-70% lagere arbeidskosten",
    body:
      "Door met professionals via de WorldEmp-methode te werken, zijn we ervan overtuigd dat je arbeidskosten met 40-70% omlaag gaan.",
  },
  allInRate: {
    heading: "Het WorldEmp-tarief is all-in",
    body:
      "Binnen ons concept werken we met een all-in tarief zonder verrassingen achteraf of ultrakleine lettertjes. Alles is inbegrepen in ons tarief en de facturatie start pas zodra er een medewerker daadwerkelijk bij je begint.",
    includes: [
      "Recruitment",
      "Talent assessment",
      "Culturele en technisch internationale testen",
      "Een werkplek in het WorldEmp-kantoor",
      "Prestatiemanagement van de medewerker",
      "Dagelijks gebruik van de virtuele werkomgeving",
      "De uitjes die we voor jouw medewerkers organiseren",
    ],
  },
  comparison: {
    heading: "WorldEmp versus traditioneel werven",
    columns: { worldemp: "WorldEmp", traditional: "Traditionele HR" },
    rows: [
      {
        point: "Internationaal netwerk",
        worldemp: "Toegang tot talent over de hele wereld",
        traditional: "Beperkt tot de lokale arbeidsmarkt",
      },
      {
        point: "Geen wervingskosten",
        worldemp: "Werving en selectie zit in het tarief",
        traditional: "Een eenmalige bemiddelingsfee per plaatsing",
      },
      {
        point: "Compliance en geen risico",
        worldemp: "Werkgeverschap, payroll en compliance bij ons",
        traditional: "Jouw entiteit draagt het risico",
      },
      {
        point: "Verhoogde productiviteit",
        worldemp: "Prestatiemanagement en upskilling inbegrepen",
        traditional: "Volledig in eigen beheer",
      },
    ],
  },
  testimonialsIntro: { eyebrow: "Klantverhalen", heading: "Wat klanten over ons zeggen" },
  testimonials: [
    {
      quote:
        "De samenwerking met WorldEmp is voor Bluedesk positief verrassend geweest. Wij zochten een ervaren .Net developer die snel ingezet kon worden.",
      name: "Barry Tempelaar",
      role: "CEO, Bluedesk",
    },
    {
      quote:
        "WorldEmp heeft een zeer grondig selectieproces, gericht op het overbruggen van culturele verschillen.",
      name: "Steven Hummel",
      role: "Manager Engineering, Innovatec",
    },
    {
      quote:
        "Als je als bedrijf groeit dan is het fijn als het personeelsbestand flexibel mee kan groeien.",
      name: "Angelique van Grinsven",
      role: "CEO, Bluetrace",
    },
    {
      quote:
        "Als hoog technologisch IT-bedrijf gespecialiseerd in e-commerce is myShop altijd op zoek naar goed opgeleide professionals.",
      name: "John Zanoni",
      role: "CTO, myShop",
    },
    {
      quote:
        "Als high-tech bedrijf dat bedrijven met big data en analytics helpt bij hun agile transformatie, leunen we op talent dat zijn vak beheerst.",
      name: "Peter Storm",
      role: "CEO, Data2Performance",
    },
  ],
  clients: [
    "Bluedesk",
    "Bluetrace",
    "Data2Performance",
    "Innovatec",
    "myShop",
    "Saman Groep",
    "Van Lent",
    "Basisonline",
    "BloomyPro",
    "Dilax",
    "HI Systems",
    "Intures",
    "IT Synergy",
    "KUBO",
  ],
  services: [
    {
      id: "digital-knowledge-migrant",
      name: "Digitale kennismigrant",
      body:
        "Een hoogopgeleide specialist die fulltime vanuit het WorldEmp-kantoor voor je werkt, volledig opgenomen in jouw team en tooling - zonder verhuizing.",
    },
    {
      id: "outsourcing",
      name: "Outsourcing",
      body:
        "Draag een hele functie of proces over. Wij bemensen, sturen en rapporteren, zodat je een resultaat afneemt in plaats van een hoofd.",
    },
    {
      id: "secondment",
      name: "Detachering",
      body:
        "Tijdelijke inzet voor een afgebakende opdracht, waarbij werkgeverschap, payroll en compliance bij ons liggen.",
    },
    {
      id: "recruitment",
      name: "Recruitment",
      body:
        "Werving en selectie binnen ons internationale netwerk, met complete assessments en zonder bemiddelingskosten.",
    },
    {
      id: "applicant-tracking-system",
      name: "Applicant tracking system",
      body:
        "Beheer je eigen wervingspijplijn op het WorldEmp-platform, met dezelfde assessmenttooling als onze recruiters.",
    },
  ],
  labels: {
    allInConceptEyebrow: "Het all-in concept",
    marquee: "Vertrouwd door teams in Nederland en daarbuiten",
    clientsLabel: "Klanten",
    propositionEyebrow: "De propositie",
  },
  ctaBand: {
    heading: "Jouw volgende collega loopt er al rond.",
    body:
      "Vertel ons welke rol je zoekt. Wij komen terug met een marktanalyse en een shortlist, en je betaalt pas zodra iemand begint.",
    primary: "Plan een afspraak",
  },
  footer: {
    blurb: "WorldEmp verbindt kennis, arbeidscapaciteit en vraag, digitaal en wereldwijd.",
    followUs: "Volg ons op",
    privacy: "Privacy- & cookieverklaring",
    sitemap: "Sitemap",
    rights: "Alle rechten voorbehouden.",
  },
  pages: {
    contact: {
      asideHeading: "Liever even bellen?",
      asideBody:
        "Een gesprek van een kwartier is meestal genoeg om je te vertellen of de rol realistisch is, en hoe lang het waarschijnlijk duurt.",
      facts: [
        { term: "Reactietijd", detail: "Binnen één werkdag" },
        { term: "Shortlist", detail: "Meestal in week twee" },
        { term: "Kosten van een aanvraag", detail: "Geen - de facturatie start als iemand begint" },
      ],
    },
    privacy: {
      eyebrow: "Juridisch",
      title: "Privacy- & cookieverklaring",
      placeholder:
        "Deze pagina is een placeholder. De goedgekeurde privacy- en cookieverklaring moet vóór livegang nog van de huidige site worden overgenomen.",
    },
    sitemap: { eyebrow: "Sitemap", title: "Alles op deze site" },
    about: {
      valuesHeading: "Missie en kernwaarden",
      values: [
        {
          title: "De mens eerst",
          body: "Elke plaatsing is een mens die bij een team komt, geen regel op een factuur. Culturele fit wegen we net zo zwaar als vakinhoud.",
        },
        {
          title: "Geen verborgen kosten",
          body: "Eén all-in tarief. Geen bemiddelingsfee, geen marge in de kleine lettertjes en geen facturatie voordat iemand begint.",
        },
        {
          title: "Echt internationaal",
          body: "Twintig jaar talentpools opbouwen buiten de lokale markt, zodat een schaarse rol een zoekvraag is en geen doodlopende weg.",
        },
        {
          title: "Betrokken na dag één",
          body: "Prestatiemanagement, upskilling en HR-ondersteuning lopen door zolang de collega bij je werkt.",
        },
      ],
      faqHeading: "Veelgestelde vragen",
      faqs: [
        {
          q: "Hoe snel kan iemand beginnen?",
          a: "Twee tot zes weken na de intake, afhankelijk van de schaarste van de rol. In week twee zie je een shortlist.",
        },
        {
          q: "Wat zit er in het all-in tarief?",
          a: "Recruitment, talent assessment, culturele en technische testen, een werkplek in het WorldEmp-kantoor, prestatiemanagement, de virtuele werkomgeving en teamuitjes.",
        },
        {
          q: "Betalen wij een bemiddelingsfee?",
          a: "Nee. Werving zit erbij in, en de facturatie start pas zodra een medewerker daadwerkelijk bij je begint.",
        },
        {
          q: "Wie is de werkgever van de collega?",
          a: "Wij. Werkgeverschap, payroll en compliance liggen bij WorldEmp, zodat jouw entiteit dat risico niet draagt.",
        },
      ],
    },
    form: {
      legend: "Vertel ons welke rol je zoekt",
      name: "Naam",
      namePlaceholder: "Jouw naam",
      company: "Bedrijf",
      companyPlaceholder: "Bedrijfsnaam",
      email: "E-mail",
      phone: "Telefoon",
      discipline: "Discipline",
      disciplines: ["IT", "Data", "Finance", "Engineering", "Iets anders"],
      message: "Bericht",
      messagePlaceholder: "Vertel over de rol, het team en de planning.",
      submit: "Verstuur aanvraag",
      submitting: "Versturen...",
      successHeading: "Je bericht staat klaar om te versturen",
      successBody: "We hebben het geopend in je mailprogramma, geadresseerd aan WorldEmp. Verstuur het en je hebt binnen één werkdag antwoord, meestal met een eerste inschatting van hoe snel de rol in te vullen is.",
      successFallback: "Niets geopend? Stuur het rechtstreeks naar ons:",
      errors: {
        name: "Vul je naam in.",
        emailMissing: "We hebben een e-mailadres nodig om te kunnen reageren.",
        emailInvalid: "Dat adres lijkt niet compleet.",
        message: "Een paar zinnen over de rol helpen ons goed te reageren.",
      },
      optional: "optioneel",
    },
  },
  mastheads: {
    services: {
      eyebrow: "Diensten",
      title: "Vijf manieren om de mensen toe te voegen die je nodig hebt",
      intro:
        "Van één specialist op afstand tot een uitbestede functie - achter elk ervan zitten dezelfde werving, assessments en ondersteuning.",
    },
    sectors: {
      eyebrow: "Sectoren",
      title: "De sectoren waarvoor wij werven",
      intro:
        "We begrijpen de unieke behoeften van elke sector en koppelen bedrijven aan de professionals die daarbij horen.",
    },
    solutions: {
      eyebrow: "Oplossingen",
      title: "Specialisten binnen vier disciplines",
      intro:
        "Open een discipline om de functies te zien waarvoor wij werven. Staat de rol die je zoekt er niet bij, dan zit die meestal wel in ons netwerk - vraag het ons.",
    },
    method: {
      eyebrow: "Werkwijze",
      title: "Hoe een nieuwe collega bij jouw team komt",
      intro:
        "Een vast ritme van intake tot onboarding, met alles eromheen - huisvesting, cultuur, aansturing - bij ons belegd.",
    },
    about: {
      eyebrow: "Over ons",
      title: "Kennis, capaciteit en vraag - verbonden",
      intro:
        "Twintig jaar internationale werving, kantoren op twee continenten en een werkwijze gebouwd voor teams op afstand.",
    },
    insights: {
      eyebrow: "Kennisbank",
      title: "Wat we lezen, schrijven en leren",
      intro:
        "Onderzoek, expertinterviews en notities uit de praktijk over internationale werving, teams op afstand en de sectoren waarvoor wij werven.",
    },
    cases: {
      eyebrow: "Klantverhalen",
      title: "Hoe de methode er in de praktijk uitziet",
      intro: "Bedrijven die via WorldEmp collega's toevoegden, in hun eigen woorden.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Hoe kunnen we je helpen?",
      intro:
        "Heb je vragen over onze diensten of wil je meer informatie? Gebruik het formulier en ons team neemt contact met je op, of bereik ons direct per e-mail of telefoon.",
    },
  },
};

export const content: Record<Locale, SiteContent> = { en, nl };

export function getContent(locale: Locale): SiteContent {
  return content[locale];
}

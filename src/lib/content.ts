/**
 * Every string here is the real copy from worldemp.com (English edition).
 * Keeping it in one typed module means the revamp can be re-skinned without
 * touching wording, and copy can be edited without going near React.
 */

export const site = {
  name: "WorldEmp",
  tagline: "Highly educated remote staff",
  mission:
    "WorldEmp connects knowledge, labour capacity and demand - digitally and globally.",
  phone: "+31 (0)88 - 400 29 00",
  phoneHref: "tel:+310884002900",
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; blurb?: string }[];
};

export const nav: NavItem[] = [
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "Digital knowledge migrant",
        href: "/services#knowledge-migrant",
        blurb: "Global specialists, working remotely as part of your team",
      },
      {
        label: "Outsourcing",
        href: "/services#outsourcing",
        blurb: "Hand over a function end to end",
      },
      {
        label: "Secondment",
        href: "/services#secondment",
        blurb: "Contract staffing for a fixed engagement",
      },
      {
        label: "Recruitment",
        href: "/services#recruitment",
        blurb: "Search and selection with no placement fee",
      },
      {
        label: "Applicant Tracking System",
        href: "/services#ats",
        blurb: "Run your own pipeline on our platform",
      },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "IT", href: "/solutions#it" },
      { label: "Data", href: "/solutions#data" },
      { label: "Finance", href: "/solutions#finance" },
      { label: "Engineering", href: "/solutions#engineering" },
    ],
  },
  { label: "Method", href: "/method" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Team", href: "/about#team" },
      { label: "Mission and core values", href: "/about#mission" },
      { label: "CSR", href: "/about#csr" },
      { label: "Knowledge base", href: "/about#knowledge" },
      { label: "FAQ", href: "/about#faq" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export const hero = {
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
};

export const allInConcept = {
  heading: "The WorldEmp all-in concept consists of:",
  cta: { label: "Discover the benefits", href: "/method" },
  pillars: [
    {
      title: "Research",
      body: "Market analysis on how quickly your vacancy can be filled",
    },
    {
      title: "Recruitment & selection",
      body: "After comprehensive selection, we quickly introduce multiple candidates",
    },
    {
      title: "Support",
      body: "Complete HR support and performance management",
    },
    {
      title: "Workspace in a high-tech environment",
      body: "We ensure that your colleagues have a fantastic workspace",
    },
    {
      title: "Upskilling and social activities",
      body: "Fun events and further development for your colleagues",
    },
  ],
};

export const timeline = {
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
};

export type Specialisation = {
  id: string;
  name: string;
  body: string;
  roles: string[];
};

export const specialisations: Specialisation[] = [
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
];

export const founderQuote = {
  quote: "Always surround yourself with people who are smarter than you.",
  name: "Frank Korf",
  role: "CEO & Founder",
};

export const costs = {
  heading: "Free recruitment and 40-70% lower labour costs",
  body:
    "By working with professionals through the WorldEmp method, we are confident that your labour costs will decrease by 40-70%.",
};

export const allInRate = {
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
};

export const comparison = {
  heading: "WorldEmp versus traditional hiring",
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
};

export const testimonials = [
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
];

/** Client names taken from the logo rail on the live site. */
export const clients = [
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
];

export const services = [
  {
    id: "knowledge-migrant",
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
    id: "ats",
    name: "Applicant Tracking System",
    body:
      "Run your own hiring pipeline on the WorldEmp platform, with the same assessment tooling our recruiters use.",
  },
];

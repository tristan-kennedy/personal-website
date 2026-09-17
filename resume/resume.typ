#import "template.typ": *

// Keep each contact URL together when the template's header wraps.
#show link: it => box(it)
#show: resume.with(
  author: "Tristan Kennedy",
  location: "Rogers, AR",
  email: "tdouglaskennedy@gmail.com",
  phone: "+1 (615) 556-4405",
  github: "github.com/tristan-kennedy",
  linkedin: "linkedin.com/in/tristandkennedy",
  personal-site: "tristan-kennedy.com",
  accent-color: "#000000",
  font: "Inter",
  font-size: 10.5pt,
  author-font-size: 23pt,
  paper: "us-letter",
)

#set text(fill: black, hyphenate: false)
#set par(justify: false)

== Experience

#work(
  title: "Software Engineer",
  company: "SPS Commerce (acquired SupplyPike in 2024)",
  location: "Rogers, AR",
  dates: "Jul 2025 - Present",
)
- Leading SupplyPike's Auth0-to-SPS identity migration as primary technical owner across applications and teams.
- Unified account linking, invitations, permissions, SSO, and machine-to-machine access under SPS identity.
- Built Databricks aggregations that normalize retailer data for shared exports and recovery workflows.
- Built and maintained TypeScript/Node.js services and RabbitMQ workers across PostgreSQL and MongoDB.

#work(
  title: "Associate Software Engineer",
  company: "SPS Commerce / SupplyPike",
  location: "Rogers, AR",
  dates: "Jul 2024 - Jul 2025",
)
- Cut application load times by -44% through targeted database indexing and elimination of N+1 queries.
- Owned shared React navigation used across products, including authentication context, hooks, and utilities.
- Standardized revenue-loss and billing data models used by multiple retailer integrations and product teams.

#work(
  title: "Software Engineer Intern",
  company: "SupplyPike",
  location: "Rogers, AR",
  dates: "May 2023 - Jul 2024",
)
- Built a configurable React/TypeScript settings experience for a revenue-loss analytics dashboard.

#work(
  title: "Information Technology Intern",
  company: "IDEMIA",
  location: "Nashville, TN",
  dates: "May 2022 - Jul 2022",
)
- Supported employee hardware, software, Active Directory, Microsoft 365, and mobile-device provisioning.

== Education
#edu(
  institution: "University of Alabama in Huntsville",
  degree: "B.S. Computer Science, Minor in Mathematics",
  location: "Huntsville, AL",
  dates: "Aug 2021 - May 2024",
  consistent: false,
)
- GPA: 4.0 / 4.0 | Summa Cum Laude | Honors College | National Merit Scholarship

== Projects
#project(
  role: "Creator & Developer",
  name: "Golf Club Curator",
  url: "golfclubcurator.com",
  dates: "Apr 2026 - Present",
)
- Building a TypeScript platform that compares golf-club specs, merchant offers, and complete bag configurations.
- Architected a TanStack Start monorepo with Better Auth, Drizzle/PostgreSQL, and shared React packages.
- Designed domain models and workflows for bag compatibility, saved configurations, merchant offers, and affiliate attribution.

== Technical Skills
- *Languages & frontend:* TypeScript, JavaScript, React
- *Backend & data:* Node.js, Koa, REST APIs, PostgreSQL, MongoDB, Redis,
  RabbitMQ, Databricks
- *Infrastructure:* Docker, Kubernetes, GitHub Actions, CI/CD, Auth0,
  OpenTelemetry, Sentry

// Keep the one-page requirement in Typst instead of a separate build script.
#locate(loc => assert(counter(page).final(loc).first() == 1, message: "Resume must fit on one page."))

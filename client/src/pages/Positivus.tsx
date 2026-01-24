import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ==================== TYPES ====================
interface ServiceCardProps {
  title: string[];
  image: string;
  variant: "light" | "lime" | "dark";
  arrowVariant: "dark" | "light";
}

interface TeamMemberProps {
  name: string;
  role: string;
  description: string;
  image: string;
}

interface TestimonialProps {
  quote: string;
  name: string;
  position: string;
}

// ==================== DATA ====================
const services: ServiceCardProps[] = [
  {
    title: ["Search engine", "optimization"],
    image: "/positivus/service-seo.png",
    variant: "light",
    arrowVariant: "dark",
  },
  {
    title: ["Pay-per-click", "advertising"],
    image: "/positivus/service-ppc.png",
    variant: "lime",
    arrowVariant: "dark",
  },
  {
    title: ["Social Media", "Marketing"],
    image: "/positivus/service-social.png",
    variant: "dark",
    arrowVariant: "light",
  },
  {
    title: ["Email", "Marketing"],
    image: "/positivus/service-email.png",
    variant: "light",
    arrowVariant: "dark",
  },
  {
    title: ["Content", "Creation"],
    image: "/positivus/service-content.png",
    variant: "lime",
    arrowVariant: "dark",
  },
  {
    title: ["Analytics and", "Tracking"],
    image: "/positivus/service-analytics.png",
    variant: "dark",
    arrowVariant: "light",
  },
];

const caseStudies = [
  "For a local restaurant, we implemented a targeted PPC campaign that resulted in a 50% increase in website traffic and a 25% increase in sales.",
  "For a B2B software company, we developed an SEO strategy that resulted in a first page ranking for key keywords and a 200% increase in organic traffic.",
  "For a national retail chain, we created a social media marketing campaign that increased followers by 25% and generated a 20% increase in online sales.",
];

const processSteps = [
  {
    number: "01",
    title: "Consultation",
    content:
      "During the initial consultation, we will discuss your business goals and objectives, target audience, and current marketing efforts. This will allow us to understand your needs and tailor our services to best fit your requirements.",
  },
  {
    number: "02",
    title: "Research and Strategy Development",
    content:
      "We conduct thorough market research and competitor analysis to develop a comprehensive digital marketing strategy tailored to your business needs.",
  },
  {
    number: "03",
    title: "Implementation",
    content:
      "Our team executes the strategy across all relevant digital channels, ensuring consistent messaging and optimal performance.",
  },
  {
    number: "04",
    title: "Monitoring and Optimization",
    content:
      "We continuously monitor campaign performance and make data-driven optimizations to maximize your ROI.",
  },
  {
    number: "05",
    title: "Reporting and Communication",
    content:
      "Regular reports and updates keep you informed about campaign progress and results, with clear metrics and insights.",
  },
  {
    number: "06",
    title: "Continual Improvement",
    content:
      "We constantly refine our approach based on performance data and emerging trends to ensure sustained growth.",
  },
];

const teamMembers: TeamMemberProps[] = [
  {
    name: "John Smith",
    role: "CEO and Founder",
    description:
      "10+ years of experience in digital marketing. Expertise in SEO, PPC, and content strategy",
    image: "/positivus/team-john.svg",
  },
  {
    name: "Jane Doe",
    role: "Director of Operations",
    description:
      "7+ years of experience in project management and team leadership. Strong organizational and communication skills",
    image: "/positivus/team-jane.svg",
  },
  {
    name: "Michael Brown",
    role: "Senior SEO Specialist",
    description:
      "5+ years of experience in SEO and content creation. Proficient in keyword research and on-page optimization",
    image: "/positivus/team-michael.svg",
  },
  {
    name: "Emily Johnson",
    role: "PPC Manager",
    description:
      "3+ years of experience in paid search advertising. Skilled in campaign management and performance analysis",
    image: "/positivus/team-emily.svg",
  },
  {
    name: "Brian Williams",
    role: "Social Media Specialist",
    description:
      "4+ years of experience in social media marketing. Proficient in creating and scheduling content, analyzing metrics, and building engagement",
    image: "/positivus/team-brian.svg",
  },
  {
    name: "Sarah Kim",
    role: "Content Creator",
    description:
      "2+ years of experience in writing and editing. Skilled in creating compelling, SEO-optimized content for various industries",
    image: "/positivus/team-sarah.svg",
  },
];

const testimonials: TestimonialProps[] = [
  {
    quote:
      '"We have been working with Positivus for the past year and have seen a significant increase in website traffic and leads as a result of their efforts. The team is professional, responsive, and truly cares about the success of our business. We highly recommend Positivus to any company looking to grow their online presence."',
    name: "John Smith",
    position: "Marketing Director at XYZ Corp",
  },
  {
    quote:
      '"We have been working with Positivus for the past year and have seen a significant increase in website traffic and leads as a result of their efforts. The team is professional, responsive, and truly cares about the success of our business. We highly recommend Positivus to any company looking to grow their online presence."',
    name: "John Smith",
    position: "Marketing Director at XYZ Corp",
  },
  {
    quote:
      '"We have been working with Positivus for the past year and have seen a significant increase in website traffic and leads as a result of their efforts. The team is professional, responsive, and truly cares about the success of our business. We highly recommend Positivus to any company looking to grow their online presence."',
    name: "John Smith",
    position: "Marketing Director at XYZ Corp",
  },
];

// ==================== COMPONENTS ====================

function Navbar() {
  return (
    <nav className="flex items-center justify-between py-6 px-4 md:px-[100px] max-w-[1440px] mx-auto">
      <img src="/positivus/logo.svg" alt="Positivus" className="h-9" />
      <div className="hidden md:flex items-center gap-10">
        <a href="#about" className="font-[family-name:var(--font-space-grotesk)] text-xl text-black hover:text-positivus-dark/70 transition-colors">
          About us
        </a>
        <a href="#services" className="font-[family-name:var(--font-space-grotesk)] text-xl text-black hover:text-positivus-dark/70 transition-colors">
          Services
        </a>
        <a href="#cases" className="font-[family-name:var(--font-space-grotesk)] text-xl text-black hover:text-positivus-dark/70 transition-colors">
          Use Cases
        </a>
        <a href="#pricing" className="font-[family-name:var(--font-space-grotesk)] text-xl text-black hover:text-positivus-dark/70 transition-colors">
          Pricing
        </a>
        <a href="#blog" className="font-[family-name:var(--font-space-grotesk)] text-xl text-black hover:text-positivus-dark/70 transition-colors">
          Blog
        </a>
        <button className="font-[family-name:var(--font-space-grotesk)] text-xl text-black border border-positivus-dark rounded-[14px] px-6 py-3 hover:bg-positivus-dark hover:text-white transition-colors">
          Request a quote
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0 px-4 md:px-[100px] py-12 max-w-[1440px] mx-auto">
      <div className="flex flex-col gap-9 max-w-[531px]">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-[60px] font-medium leading-tight text-black">
          Navigating the digital landscape for success
        </h1>
        <p className="font-[family-name:var(--font-space-grotesk)] text-lg md:text-xl text-black leading-7">
          Our digital marketing agency helps businesses grow and succeed online
          through a range of services including SEO, PPC, social media
          marketing, and content creation.
        </p>
        <button className="w-fit font-[family-name:var(--font-space-grotesk)] text-xl text-white bg-positivus-dark rounded-[14px] px-9 py-5 hover:bg-positivus-dark/90 transition-colors">
          Book a consultation
        </button>
      </div>
      <img
        src="/positivus/hero-illustration.svg"
        alt="Digital Marketing Illustration"
        className="w-full max-w-[600px] h-auto"
      />
    </section>
  );
}

function LogoBar() {
  return (
    <section className="py-8">
      <img
        src="/positivus/logo-bar.svg"
        alt="Partner Logos"
        className="w-full max-w-[1440px] mx-auto"
      />
    </section>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 px-4 md:px-[100px] max-w-[1440px] mx-auto">
      <span className="font-[family-name:var(--font-space-grotesk)] text-3xl md:text-[40px] font-medium text-black bg-positivus-lime px-2 py-1 rounded-md whitespace-nowrap">
        {title}
      </span>
      <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-black max-w-[580px]">
        {description}
      </p>
    </div>
  );
}

function ServiceCard({ title, image, variant, arrowVariant }: ServiceCardProps) {
  const bgClass =
    variant === "light"
      ? "bg-positivus-gray"
      : variant === "lime"
      ? "bg-positivus-lime"
      : "bg-positivus-dark";
  const textClass = variant === "dark" ? "text-white" : "text-black";
  const titleBgClass =
    variant === "dark"
      ? "bg-white text-black"
      : variant === "lime"
      ? "bg-black text-positivus-lime"
      : "bg-positivus-lime text-black";

  return (
    <div
      className={`${bgClass} rounded-[45px] border border-positivus-dark shadow-[0px_5px_0px_#191a23] p-12 flex justify-between min-h-[310px] relative overflow-hidden`}
    >
      <div className="flex flex-col justify-between z-10">
        <div className="flex flex-col gap-0">
          {title.map((line, i) => (
            <span
              key={i}
              className={`font-[family-name:var(--font-space-grotesk)] text-2xl md:text-[30px] font-medium ${titleBgClass} px-1 w-fit`}
            >
              {line}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 cursor-pointer group">
          <img
            src={
              arrowVariant === "dark"
                ? "/positivus/arrow-icon-dark.svg"
                : "/positivus/arrow-icon-light.svg"
            }
            alt="Arrow"
            className="w-10 h-10 group-hover:scale-110 transition-transform"
          />
          <span
            className={`font-[family-name:var(--font-space-grotesk)] text-xl ${textClass}`}
          >
            Learn more
          </span>
        </div>
      </div>
      <img
        src={image}
        alt={title.join(" ")}
        className="w-[180px] md:w-[210px] h-auto object-contain absolute right-6 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}

function Services() {
  return (
    <section id="services" className="py-16">
      <SectionHeading
        title="Services"
        description="At our digital marketing agency, we offer a range of services to help businesses grow and succeed online. These services include:"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 md:px-[100px] mt-16 max-w-[1440px] mx-auto">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="px-4 md:px-[100px] py-16 max-w-[1440px] mx-auto">
      <div className="bg-positivus-gray rounded-[45px] p-12 md:p-16 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden">
        <div className="flex flex-col gap-6 max-w-[500px] z-10">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl md:text-[30px] font-medium text-black">
            Let's make things happen
          </h2>
          <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-black">
            Contact us today to learn more about how our digital marketing
            services can help your business grow and succeed online.
          </p>
          <button className="w-fit font-[family-name:var(--font-space-grotesk)] text-xl text-white bg-positivus-dark rounded-[14px] px-9 py-5 hover:bg-positivus-dark/90 transition-colors">
            Get your free proposal
          </button>
        </div>
        <img
          src="/positivus/cta-illustration.svg"
          alt="CTA Illustration"
          className="w-[300px] md:w-[359px] h-auto mt-8 lg:mt-0 lg:absolute lg:right-12"
        />
      </div>
    </section>
  );
}

function CaseStudies() {
  return (
    <section id="cases" className="py-16">
      <SectionHeading
        title="Case Studies"
        description="Explore Real-Life Examples of Our Proven Digital Marketing Success through Our Case Studies"
      />
      <div className="bg-positivus-dark rounded-[45px] mt-16 mx-4 md:mx-[100px] max-w-[1240px] lg:mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 p-12 md:p-16">
          {caseStudies.map((study, index) => (
            <div key={index} className="flex">
              <div className="flex flex-col gap-5 pr-8 py-4">
                <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-white">
                  {study}
                </p>
                <a
                  href="#"
                  className="flex items-center gap-4 group"
                >
                  <span className="font-[family-name:var(--font-space-grotesk)] text-xl text-positivus-lime">
                    Learn more
                  </span>
                  <img
                    src="/positivus/arrow-green.svg"
                    alt="Arrow"
                    className="w-4 h-3 group-hover:translate-x-1 transition-transform"
                  />
                </a>
              </div>
              {index < 2 && (
                <div className="hidden lg:block w-px bg-white/30 mx-8" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkingProcess() {
  return (
    <section className="py-16">
      <SectionHeading
        title="Our Working Process"
        description="Step-by-Step Guide to Achieving Your Business Goals"
      />
      <div className="flex flex-col gap-8 px-4 md:px-[100px] mt-16 max-w-[1440px] mx-auto">
        <Accordion type="single" collapsible defaultValue="item-0">
          {processSteps.map((step, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className={`${
                index === 0
                  ? "bg-positivus-lime"
                  : "bg-positivus-gray"
              } rounded-[45px] border border-positivus-dark shadow-[0px_5px_0px_#191a23] mb-8 px-8 md:px-12 py-6 data-[state=open]:bg-positivus-lime`}
            >
              <AccordionTrigger className="hover:no-underline [&[data-state=open]>div>img]:hidden [&[data-state=closed]>div>.minus-icon]:hidden">
                <div className="flex items-center gap-6 w-full">
                  <span className="font-[family-name:var(--font-space-grotesk)] text-4xl md:text-[60px] font-medium text-black">
                    {step.number}
                  </span>
                  <span className="font-[family-name:var(--font-space-grotesk)] text-xl md:text-[30px] font-medium text-black text-left">
                    {step.title}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src="/positivus/plus-icon.svg"
                    alt="Expand"
                    className="w-14 h-14"
                  />
                  <img
                    src="/positivus/minus-icon.svg"
                    alt="Collapse"
                    className="minus-icon w-14 h-14"
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="border-t border-black pt-6 mt-4">
                  <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-black">
                    {step.content}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function TeamCard({ name, role, description, image }: TeamMemberProps) {
  return (
    <div className="bg-white border border-positivus-dark rounded-[45px] shadow-[0px_5px_0px_#191a23] p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-end gap-5">
          <img src={image} alt={name} className="w-[106px] h-[103px]" />
          <div>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-medium text-black">
              {name}
            </h3>
            <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-black">
              {role}
            </p>
          </div>
        </div>
        <img
          src="/positivus/linkedin-icon.svg"
          alt="LinkedIn"
          className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
      <div className="border-t border-black pt-6">
        <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-black">
          {description}
        </p>
      </div>
    </div>
  );
}

function Team() {
  return (
    <section className="py-16">
      <SectionHeading
        title="Team"
        description="Meet the skilled and experienced team behind our successful digital marketing strategies"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 md:px-[100px] mt-16 max-w-[1440px] mx-auto">
        {teamMembers.map((member, index) => (
          <TeamCard key={index} {...member} />
        ))}
      </div>
      <div className="flex justify-end px-4 md:px-[100px] mt-10 max-w-[1440px] mx-auto">
        <button className="font-[family-name:var(--font-space-grotesk)] text-xl text-white bg-positivus-dark rounded-[14px] px-9 py-5 hover:bg-positivus-dark/90 transition-colors">
          See all team
        </button>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, name, position }: TestimonialProps) {
  return (
    <div className="flex flex-col min-w-[400px] md:min-w-[500px]">
      <div className="relative bg-positivus-dark border border-positivus-lime rounded-[45px] p-8 mb-6">
        <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-white">
          {quote}
        </p>
        <div className="absolute -bottom-4 left-12 w-6 h-6 bg-positivus-dark border-l border-b border-positivus-lime rotate-[-45deg]" />
      </div>
      <div className="pl-12">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xl text-positivus-lime font-medium">
          {name}
        </p>
        <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-white">
          {position}
        </p>
      </div>
    </div>
  );
}

function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(1);

  return (
    <section className="py-16">
      <SectionHeading
        title="Testimonials"
        description="Hear from Our Satisfied Clients: Read Our Testimonials to Learn More about Our Digital Marketing Services"
      />
      <div className="bg-positivus-dark rounded-[45px] mt-16 mx-4 md:mx-[100px] py-16 max-w-[1240px] lg:mx-auto overflow-hidden">
        <div className="flex gap-8 px-8 overflow-x-auto scrollbar-hide">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-8 mt-16">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            className="opacity-30 hover:opacity-100 transition-opacity"
          >
            <img src="/positivus/arrow-left.svg" alt="Previous" className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <img
                key={index}
                src="/positivus/star.svg"
                alt="Star"
                className={`w-4 h-4 cursor-pointer ${
                  index === currentSlide ? "opacity-100" : "opacity-30"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          <button
            onClick={() =>
              setCurrentSlide(Math.min(testimonials.length - 1, currentSlide + 1))
            }
            className="hover:opacity-70 transition-opacity"
          >
            <img src="/positivus/arrow-right.svg" alt="Next" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [contactType, setContactType] = useState<"sayhi" | "quote">("sayhi");

  return (
    <section id="contact" className="py-16">
      <SectionHeading
        title="Contact Us"
        description="Connect with Us: Let's Discuss Your Digital Marketing Needs"
      />
      <div className="bg-positivus-gray rounded-[45px] mt-16 mx-4 md:mx-[100px] p-12 md:p-16 flex flex-col lg:flex-row gap-16 max-w-[1240px] lg:mx-auto relative overflow-hidden">
        <div className="flex flex-col gap-10 max-w-[530px] z-10">
          <div className="flex gap-9">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="contactType"
                checked={contactType === "sayhi"}
                onChange={() => setContactType("sayhi")}
                className="hidden"
              />
              <div
                className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center ${
                  contactType === "sayhi" ? "bg-positivus-lime" : "bg-white"
                }`}
              >
                {contactType === "sayhi" && (
                  <div className="w-3 h-3 rounded-full bg-black" />
                )}
              </div>
              <span className="font-[family-name:var(--font-space-grotesk)] text-lg text-black">
                Say Hi
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="contactType"
                checked={contactType === "quote"}
                onChange={() => setContactType("quote")}
                className="hidden"
              />
              <div
                className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center ${
                  contactType === "quote" ? "bg-positivus-lime" : "bg-white"
                }`}
              >
                {contactType === "quote" && (
                  <div className="w-3 h-3 rounded-full bg-black" />
                )}
              </div>
              <span className="font-[family-name:var(--font-space-grotesk)] text-lg text-black">
                Get a Quote
              </span>
            </label>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-space-grotesk)] text-base text-black">
                Name
              </label>
              <input
                type="text"
                placeholder="Name"
                className="font-[family-name:var(--font-space-grotesk)] text-lg text-black bg-white border border-black rounded-[14px] px-6 py-4 placeholder:text-positivus-muted focus:outline-none focus:border-positivus-lime"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-space-grotesk)] text-base text-black">
                Email*
              </label>
              <input
                type="email"
                placeholder="Email"
                required
                className="font-[family-name:var(--font-space-grotesk)] text-lg text-black bg-white border border-black rounded-[14px] px-6 py-4 placeholder:text-positivus-muted focus:outline-none focus:border-positivus-lime"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-[family-name:var(--font-space-grotesk)] text-base text-black">
                Message*
              </label>
              <textarea
                placeholder="Message"
                required
                rows={5}
                className="font-[family-name:var(--font-space-grotesk)] text-lg text-black bg-white border border-black rounded-[14px] px-6 py-4 placeholder:text-positivus-muted focus:outline-none focus:border-positivus-lime resize-none"
              />
            </div>
          </div>
          <button className="font-[family-name:var(--font-space-grotesk)] text-xl text-white bg-positivus-dark rounded-[14px] px-9 py-5 hover:bg-positivus-dark/90 transition-colors">
            Send Message
          </button>
        </div>
        <img
          src="/positivus/contact-illustration.svg"
          alt="Contact Illustration"
          className="hidden lg:block w-[450px] h-auto absolute right-0 top-1/2 -translate-y-1/2"
        />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-positivus-dark rounded-t-[45px] mt-16 mx-4 md:mx-[100px] max-w-[1240px] lg:mx-auto">
      <div className="p-12 md:p-16">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
          <img src="/positivus/logo-white.svg" alt="Positivus" className="h-7" />
          <nav className="flex flex-wrap gap-10">
            <a
              href="#"
              className="font-[family-name:var(--font-space-grotesk)] text-lg text-white underline hover:text-positivus-lime transition-colors"
            >
              About us
            </a>
            <a
              href="#"
              className="font-[family-name:var(--font-space-grotesk)] text-lg text-white underline hover:text-positivus-lime transition-colors"
            >
              Services
            </a>
            <a
              href="#"
              className="font-[family-name:var(--font-space-grotesk)] text-lg text-white underline hover:text-positivus-lime transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#"
              className="font-[family-name:var(--font-space-grotesk)] text-lg text-white underline hover:text-positivus-lime transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="font-[family-name:var(--font-space-grotesk)] text-lg text-white underline hover:text-positivus-lime transition-colors"
            >
              Blog
            </a>
          </nav>
          <div className="flex gap-5">
            <a href="#" className="hover:opacity-80 transition-opacity">
              <img
                src="/positivus/social-linkedin.svg"
                alt="LinkedIn"
                className="w-8 h-8"
              />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <img
                src="/positivus/social-facebook.svg"
                alt="Facebook"
                className="w-8 h-8"
              />
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity">
              <img
                src="/positivus/social-twitter.svg"
                alt="Twitter"
                className="w-8 h-8"
              />
            </a>
          </div>
        </div>

        {/* Middle Row */}
        <div className="flex flex-col lg:flex-row gap-16 mb-12">
          <div className="flex flex-col gap-7">
            <span className="font-[family-name:var(--font-space-grotesk)] text-xl font-medium text-black bg-positivus-lime px-2 py-1 w-fit rounded">
              Contact us:
            </span>
            <div className="flex flex-col gap-4">
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-white">
                Email: info@positivus.com
              </p>
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-white">
                Phone: 555-567-8901
              </p>
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-white">
                Address: 1234 Main St
                <br />
                Moonstone City, Stardust State 12345
              </p>
            </div>
          </div>
          <div className="bg-[#292A32] rounded-[14px] p-8 flex flex-col md:flex-row items-center gap-5 flex-1">
            <input
              type="email"
              placeholder="Email"
              className="font-[family-name:var(--font-space-grotesk)] text-lg text-white bg-transparent border border-white rounded-[14px] px-6 py-4 placeholder:text-white flex-1 w-full focus:outline-none focus:border-positivus-lime"
            />
            <button className="font-[family-name:var(--font-space-grotesk)] text-xl text-black bg-positivus-lime rounded-[14px] px-9 py-4 hover:bg-positivus-lime/90 transition-colors whitespace-nowrap">
              Subscribe to news
            </button>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-white pt-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-[family-name:var(--font-space-grotesk)] text-lg text-white">
            © 2023 Positivus. All Rights Reserved.
          </p>
          <a
            href="#"
            className="font-[family-name:var(--font-space-grotesk)] text-lg text-white underline hover:text-positivus-lime transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN PAGE ====================
export default function Positivus() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <LogoBar />
      <Services />
      <CTABanner />
      <CaseStudies />
      <WorkingProcess />
      <Team />
      <Testimonials />
      <ContactForm />
      <Footer />
    </div>
  );
}

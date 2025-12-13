import { drizzle } from "drizzle-orm/mysql2";
import { projects, certifications, resources } from "./drizzle/schema.ts";

console.log("🌱 Starting database seeding...");

const db = drizzle(process.env.DATABASE_URL);

// Sample projects data
const sampleProjects = [
  {
    title: "IoT Smart Home System",
    description: "Developed a comprehensive IoT-based smart home automation system using ESP32 microcontrollers. The system integrates multiple sensors and actuators for temperature control, lighting automation, and security monitoring. Features include real-time data visualization through a web dashboard and mobile app integration.",
    technologies: JSON.stringify(["ESP32", "C/C++", "MQTT", "FreeRTOS", "React", "Node.js"]),
    category: "iot",
    featured: 1,
    displayOrder: 1,
  },
  {
    title: "Real-Time Operating System for ARM Cortex-M",
    description: "Implemented a lightweight real-time operating system (RTOS) for ARM Cortex-M microcontrollers. The RTOS supports task scheduling, inter-task communication, and memory management. Optimized for low-power embedded applications with minimal footprint.",
    technologies: JSON.stringify(["ARM Cortex-M", "C", "Assembly", "RTOS", "Embedded Linux"]),
    category: "firmware",
    featured: 1,
    displayOrder: 2,
  },
  {
    title: "Industrial Automation Controller",
    description: "Designed and developed a PLC-based industrial automation controller for manufacturing processes. Implemented safety protocols, fault detection, and real-time monitoring capabilities. The system reduced downtime by 30% and improved production efficiency.",
    technologies: JSON.stringify(["PLC", "Ladder Logic", "Modbus", "HMI", "SCADA"]),
    category: "embedded",
    featured: 0,
    displayOrder: 3,
  },
];

// Sample certifications data
const sampleCertifications = [
  {
    title: "Embedded Systems Certification",
    issuer: "IEEE Computer Society",
    issueDate: "2023-06",
    credentialId: "IEEE-ES-2023-001",
    description: "Professional certification in embedded systems design and development, covering microcontroller programming, RTOS, and hardware-software integration.",
    displayOrder: 1,
  },
  {
    title: "ARM Accredited Engineer",
    issuer: "ARM Holdings",
    issueDate: "2022-11",
    expiryDate: "2025-11",
    credentialId: "ARM-AAE-2022-456",
    description: "Certification demonstrating expertise in ARM architecture, Cortex-M series microcontrollers, and embedded software development.",
    displayOrder: 2,
  },
];

// Sample resources data
const sampleResources = [
  {
    title: "Embedded C Programming Guide",
    description: "Comprehensive guide to embedded C programming best practices, memory optimization techniques, and real-world examples.",
    fileUrl: "https://example.com/embedded-c-guide.pdf",
    fileKey: "resources/embedded-c-guide.pdf",
    fileName: "embedded-c-guide.pdf",
    fileSize: 2048000,
    mimeType: "application/pdf",
    category: "document",
    displayOrder: 1,
  },
  {
    title: "RTOS Implementation Source Code",
    description: "Complete source code for a lightweight RTOS implementation with task scheduling and memory management.",
    fileUrl: "https://example.com/rtos-source.zip",
    fileKey: "resources/rtos-source.zip",
    fileName: "rtos-source.zip",
    fileSize: 512000,
    mimeType: "application/zip",
    category: "code",
    displayOrder: 2,
  },
];

async function seed() {
  try {
    // Insert projects
    console.log("📦 Seeding projects...");
    for (const project of sampleProjects) {
      await db.insert(projects).values(project);
    }
    console.log(`✅ Inserted ${sampleProjects.length} projects`);

    // Insert certifications
    console.log("🎓 Seeding certifications...");
    for (const cert of sampleCertifications) {
      await db.insert(certifications).values(cert);
    }
    console.log(`✅ Inserted ${sampleCertifications.length} certifications`);

    // Insert resources
    console.log("📚 Seeding resources...");
    for (const resource of sampleResources) {
      await db.insert(resources).values(resource);
    }
    console.log(`✅ Inserted ${sampleResources.length} resources`);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();

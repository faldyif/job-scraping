require('dotenv').config();

import { createClient } from '@supabase/supabase-js';
import { Ollama } from 'ollama';

// Initialize Supabase client
const supabaseUrl = `${process.env.SUPABASE_URL}`;
const supabaseKey = `${process.env.SUPABASE_KEY}`;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Ollama client with your Ollama host
const ollama = new Ollama({ host: process.env.OLLAMA_BASE_URL });

// Define the applicant profile summary
const applicantProfileSummary = `
**Faldy Ikhwan Fadila**

* **Experienced Software Engineer:** 6+ years of experience specializing in backend development, API design, and microservices architecture.
* **Technical Leadership:** Proven track record leading technical teams and optimizing system performance.
* **Cutting-Edge Technologies:** Expertise in LLM integration, NodeJS, TypeScript, and database management.
* **Industry Focus:** Strong foundation in SaaS and health tech industries.

**Key Skills:**

* **Expert:** NodeJS, TypeScript, SQL, MongoDB, PHP, Laravel, System Design, Databases
* **Intermediate:** Java, Go, Python, NestJS, Microservice, Linux

**Notable Achievements:**

* Designed and developed a custom API gateway, improving system response time for a microservice architecture.
* Led a team to deliver a new API platform, resulting in a 40% increase in order volume.
* Optimized system performance, reducing cloud infrastructure costs by 40% and API response times by up to 90%.
* Developed a PoC for doctor assistant integration with LLM, reducing diagnosis time by 30%.
* Spearheaded a JavaScript to TypeScript migration, increasing developer productivity.
* Implemented comprehensive API documentation, leading to successful onboarding of new partners and reduced support tickets.
* Developed internal tools for QA testing and marketplace synchronization, improving efficiency and accuracy.

**Work Experience Highlights:**

* **PT Indopasifik Teknologi Medika Indonesia (Lifepack.id, Tetama.id):**
    * Principal Engineer: Designed and led the development of a new API gateway and platform, resulting in significant performance improvements and increased order volume.
    * Senior Backend Engineer: Optimized critical API endpoints, implemented comprehensive API documentation, and spearheaded partner onboarding initiatives.
    * Backend Engineer: Migrated codebase to TypeScript, optimized high-traffic endpoints, and developed internal QA testing tools.
* **Sakoo.id (Start-up subsidiary of PT Telekomunikasi Indonesia):**
    * Lead Backend Developer: Led the development of an MVP for a B2B ecommerce platform, implemented microservice architecture, and introduced new engineering practices.
    * Back End Developer: Contributed to the development of an omnichannel marketplace synchronization system, improving data accuracy and reducing manual data entry.
* **PT Global Inovasi Utama:**
    * Junior Programmer: Developed multi-platform apps using Ionic Framework and maintained a log gathering app for ATM machines.

**Education:**

* Bachelor's Degree in Information System, Universitas Bina Nusantara (GPA: 3.61)
* Associate's Degree in Computer Science and Information System, Universitas Gadjah Mada (GPA: 3.43)

**Languages:**

* Indonesian (Native)
* English (Professional working proficiency)
`;

// Function to fetch job listings from Supabase
async function fetchJobListings() {
  const { data, error } = await supabase
    .from('job_listings')
    .select('*');

  if (error) {
    console.error('Error fetching job listings:', error);
    return [];
  }

  return data;
}

// Function to format a job listing for LLM processing
function formatJobListingForLLM(jobListing: any) {
  return `
    Job Title: ${jobListing.title}
    Company: ${jobListing.company}
    Job Type: ${jobListing.job_type}
    Industries: ${jobListing.industries.join(', ')}
    Location: ${jobListing.is_remote ? 'Remote' : jobListing.city}
    Experience Required: ${jobListing.experience_min} - ${jobListing.experience_max} years
    Skills Required: ${jobListing.job_skills.join(', ')}
    Salary: ${jobListing.is_salary_visible ? `${jobListing.currency} ${jobListing.salary_min} - ${jobListing.salary_max}` : 'Not disclosed'}
    Description: ${jobListing.description}
  `;
}

// Function to send formatted job listing to Ollama for suitability analysis
async function sendToLLM(formattedJobListing: string, applicantProfileSummary: string) {
  const prompt = `
  You are an AI job match evaluator. Your role is to assess whether an applicant is suitable for a specific job based on the information provided.

  You will receive two inputs:
  1. An applicant's profile summary
  2. A job listing detail

  Your task is to analyze these inputs and determine if the applicant is a good match for the job. Consider factors such as skills, experience, qualifications, and any other relevant information provided in both the applicant's profile and the job listing.

  After your analysis, you must respond with ONLY one of the following:
  - \`true\` if you determine the applicant is suitable for the job
  - \`false\` if you determine the applicant is not suitable for the job

  Do not provide any explanation or additional information. Your response should consist of only the word "true" or "false".

  --- Start Applicant's Profile Summary ---
  ${applicantProfileSummary}
  --- End Applicant's Profile Summary ---

  --- Start Job Listing Detail ---
  ${formattedJobListing}
  --- End Job Listing Detail ---
  `;

  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL_NAME || 'llama3',
    messages: [
      { role: 'user', content: prompt },
    ],
  });
  return response.message.content;
}

async function updateJobListing(jobListingId: string, isSuitable: boolean) {
  const { data, error } = await supabase
    .from('job_listings')
    .update({ is_suitable: isSuitable })
    .eq('id', jobListingId);

  if (error) {
    console.error('Error updating job listing:', error);
  } else {
    console.log('Job listing updated successfully:', data);
  }
}

// Main function to process job listings
async function processJobListings() {
  const jobListings = await fetchJobListings();
  const chunkSize = 10;

  for (let i = 0; i < jobListings.length; i += chunkSize) {
    const chunk = jobListings.slice(i, i + chunkSize);

    await Promise.all(chunk.map(async (jobListing) => {
      const formattedJobListing = formatJobListingForLLM(jobListing);
      console.log('Formatted Job Listing for LLM:', formattedJobListing);

      const suitabilityAnalysis = await sendToLLM(formattedJobListing, applicantProfileSummary);
      const isSuitable = suitabilityAnalysis.toLowerCase().trim() === 'true';
      console.log('Suitability Analysis:', jobListing.id, isSuitable);

      // Update the job listing with the suitability analysis result
      await updateJobListing(jobListing.id, isSuitable);
    }));
  }
}

// Run the main function
processJobListings().catch(console.error);
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';

// Initialize Supabase client
const supabaseUrl = `${process.env.SUPABASE_URL}`;
const supabaseKey = `${process.env.SUPABASE_KEY}`;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch job listings with pagination
async function fetchJobListings() {
  let allHits: any[] = [];
  let page = 0;
  const hitsPerPage = 1000;

  while (true) {
    const data = JSON.stringify({
      requests: [
        {
          indexName: 'job_postings',
          params: `query=&hitsPerPage=${hitsPerPage}&maxValuesPerFacet=1000&page=${page}&facets=%5B%22*%22%2C%22city.work_country_name%22%2C%22position.name%22%2C%22industries.vertical_name%22%2C%22experience%22%2C%22job_type.name%22%2C%22is_salary_visible%22%2C%22has_equity%22%2C%22currency.currency_code%22%2C%22salary_min%22%2C%22taxonomies.slug%22%5D&tagFilters=&facetFilters=%5B%5B%22city.work_country_name%3AIndonesia%22%5D%5D`
        }
      ]
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://219wx3mpv4-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.30.0%3BJS%20Helper%202.26.1&x-algolia-application-id=219WX3MPV4&x-algolia-api-key=b528008a75dc1c4402bfe0d8db8b3f8e',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      data: data
    };

    try {
      const response = await axios.request(config);
      const hits = response.data.results[0].hits;
      allHits = allHits.concat(hits);

      // If the number of hits is less than the hitsPerPage, we have reached the last page
      if (hits.length < hitsPerPage) {
        break;
      }

      // Increment the page for the next iteration
      page++;
    } catch (error) {
      console.error('Error fetching job listings:', error);
      break;
    }
  }

  return allHits;
}

// Function to clean and format job listings
function cleanAndFormatJobListings(jobListings: any[]) {
  return jobListings.map(job => {
    return {
      id: job.objectID,
      city: `${job.city.name}, ${job.city.country_name}`,
      company: job.company.name,
      currency: job.currency.name,
      description: sanitizeHtml(job.description, {
        allowedTags: [], // No HTML tags allowed
        allowedAttributes: {}, // No attributes allowed
      }),
      experience: job.experience,
      experience_max: job.experience_max,
      experience_min: job.experience_min,
      expires_at: job.expires_at,
      external_link: job.external_link,
      has_equity: job.has_equity,
      industries: job.industries.map((industry: any) => industry.name),
      is_boosted: job.is_boosted,
      is_remote: job.is_remote,
      is_salary_visible: job.is_salary_visible,
      job_skills: job.job_skills.map((skill: any) => skill.name),
      job_type: job.job_type.name,
      position: job.position.name,
      published_at: job.published_at,
      salary_avg: job.salary_avg,
      salary_max: job.salary_max,
      salary_min: job.salary_min,
      starts_featuring_at: job.starts_featuring_at,
      taxonomies: job.taxonomies,
      title: job.title,
      vacancy_count: job.vacancy_count,
    };
  });
}

// Function to insert job listings into Supabase
async function insertJobListingsToSupabase(jobListings: any[]) {
  const { data, error } = await supabase
    .from('job_listings')
    .upsert(jobListings);

  if (error) {
    console.error('Error inserting job listings:', error);
  } else {
    console.log('Job listings inserted successfully:', jobListings.length);
  }
}

// Main function to orchestrate the process
async function main() {
  const jobListings = await fetchJobListings();
  const cleanedJobListings = cleanAndFormatJobListings(jobListings);
  await insertJobListingsToSupabase(cleanedJobListings);
  return 0;
}

// Run the main function
main();
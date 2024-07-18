# Job Scraping and Analysis

This project is designed to scrape job listings from TechInAsia, clean and format the data, insert it into a Supabase database, and then analyze the suitability of each job listing for a given applicant profile using a Large Language Model (LLM). This project is intended for educational purposes and to demonstrate the use of web scraping, data cleaning, database management, and natural language processing techniques.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Supabase account and project OR self hosted Supabase
- OpenAI API key (for using the GPT model) or OpenRouter API key or Ollama running locally/self hosted

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/faldyif/job-scraping.git
   ```

2. Navigate to the project directory:

   ```sh
   cd job-scraping
   ```

3. Install the dependencies:

   ```sh
   npm install
   # or
   yarn install
   ```

4. Set up your environment variables. You can do this by creating a `.env` file in the root of the project and adding your configurations.

5. Run the schema from `schema/job_listings.sql` to your Supabase database.

## Usage

To scrape job listings and analyze them, run the following command:

```sh
npm start
# or
yarn start
```

To only scrape job listings without analysis, run:

```sh
npm run scrape
# or
yarn scrape
```

Then you can view the data in your Supabase database.

## Project Structure

- `src/`: Contains all the source code.
  - `index.ts`: Main file for the project.
  - `scrape.ts`: File for scraping job listings.
  - `clean.ts`: File for cleaning and formatting the scraped data.
- `.env`: Environment variables file.
- `.gitignore`: Git ignore file.
- `package.json`: Node.js package file.
- `tsconfig.json`: TypeScript configuration file.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[ISC](https://choosealicense.com/licenses/isc/)
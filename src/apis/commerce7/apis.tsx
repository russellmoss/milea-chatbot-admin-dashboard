import axios from "axios";

const C7_API_URL = process.env.REACT_APP_C7_BASE_URL || "https://api.commerce7.com/v1";
const C7_APP_ID = process.env.REACT_APP_C7_APP_ID;
const C7_SECRET_KEY = process.env.REACT_APP_C7_SECRET_KEY;
const C7_TENANT_ID = process.env.REACT_APP_C7_TENANT_ID;
const c7AuthConfig = {
    auth: {
        username: C7_APP_ID!,
        password: C7_SECRET_KEY!
    },
    headers: {
        Tenant: C7_TENANT_ID!,
        "Content-Type": "application/json"
    }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getAllCustomers = async (page: number): Promise<any> => {
  try {
    const response = await axios.get(
      `${C7_API_URL}/club-membership?status=Active&page=${page}&limit=50`,
      c7AuthConfig
    );
    return response.data;
  } catch (error: any) {
    // If rate limited (HTTP 429), wait and retry once
    if (error.response?.status === 429) {
      console.warn(`Rate limited on page ${page}. Retrying after delay...`);
      await delay(2000); // Wait 2 seconds
      return getAllCustomers(page); // Retry
    }

    console.error('Error fetching customers:', error.message);
    throw error;
  }
};


export const getAllClubMembers = async (): Promise<any[]> => {
  let allCustomers: any[] = [];
  let page = 1;

  while (true) {
    const response = await getAllCustomers(page);

    // Check that response and response.customers exist
    const customers = response?.clubMemberships;
    if (!Array.isArray(customers)) {
      console.warn(`No customers array returned for page ${page}. Stopping.`);
      break;
    }

    allCustomers = allCustomers.concat(customers);

    if (customers.length < 50) {
      break; // No more pages
    }

    page++;

    // Optional: small delay between requests to be kind to the API
    await delay(200);
  }

  return allCustomers;
};



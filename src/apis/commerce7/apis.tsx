import axios from "axios";

// C7_BASE_URL=https://api.commerce7.com/v1
// C7_APP_ID=milea-chatbot
// C7_SECRET_KEY=X2rftYOMslE7wQJNaPbKnF1ghcoU0mHd93VTyCxBRLAZGqieWpkv8uD4nzS6Mtj5
// C7_TENANT_ID=milea-estate-vineyard
const C7_API_URL = process.env.REACT_APP_C7_BASE_URL || "https://api.commerce7.com/v1";
const C7_APP_ID = process.env.REACT_APP_C7_APP_ID;
const C7_SECRET_KEY = process.env.REACT_APP_C7_SECRET_KEY;
const C7_TENANT_ID = process.env.REACT_APP_C7_TENANT_ID;
console.log('C7 API Config:', {
    C7_API_URL,
    C7_APP_ID,
    C7_SECRET_KEY,
    C7_TENANT_ID
});
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

const getAllCustomers = async (): Promise<any> => {
  try {
    const response = await axios.get(
        `${C7_API_URL}/club-membership?status=Active`,
        c7AuthConfig
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};


export const getAllClubMembers = async (): Promise<any[]> => {
    const response = await getAllCustomers();
    const customers = response.customers;
    console.log('Fetched customers:', customers);
    return customers;
};



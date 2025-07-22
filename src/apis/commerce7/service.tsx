import { Contact } from "../../types/sms";
import { createSmsContact, getContactByNamesAndPhone } from "../sms/apis";
import { CreateContactRequest } from "../sms/interfaces";


export const syncC7Contacts = async (customers: any[]): Promise<Contact[]> => {
    // Create an array of promises for each customer
    const contactPromises = customers.map(async (customer) => {
        let body: CreateContactRequest;

        try {
            body = buildContactCreationRequest(customer);
        } catch (error) {
            console.warn('Error building contact creation request:', error);
            console.debug('While Erroring, customer 1:', customer); 
            return null;
        }

        try {
            const existingContact = await getContactByNamesAndPhone(body.firstName, body.lastName, body.phoneNumber);
            if (existingContact) {
                return existingContact;
            }

            const newContact = await createSmsContact(body);
            return newContact;
        } catch (error) {
            console.error('Error syncing customer:', error);
            console.debug('While Erroring, customer 2:', customer);
            return null;
        }
    });

    // Wait for all promises to complete
    const results = await Promise.all(contactPromises);

    // Filter out any nulls (due to errors or skips)
    return results.filter((contact): contact is Contact => contact !== null);
};


const buildContactCreationRequest = (customer: any): CreateContactRequest => {
  return {
    firstName: customer.customer.firstName,
    lastName: customer.customer.lastName,
    phoneNumber: customer.customer.phones[0].phone,
    email: customer.customer.emails[0] ? customer.customer.emails[0].email : "",
    optIn: true,
    createdAt: customer.createdAt,
    updatedAt: customer.customer.updatedAt,
    userId: customer.customer.id,
    lists: [],
    tags: [],
    birthdate: customer.customer.birthDate,
    notes: "",
  };
}
import { getCustomer } from "@/lib/queries/getCustomer";
import { BackButton } from "@/components/BackButton";
import * as Sentry from "@sentry/nextjs";
import CustomerForm from "@/app/(rs)/customers/form/CustomerForm";

export const dynamic = "force-dynamic";

export default async function CustomerFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  try {
    const params = await searchParams;
    console.log("=== DEBUG: All searchParams:", params);
    const { customerId } = params;
    console.log("=== DEBUG: customerId extracted:", customerId);

    // Edit customer form
    if (customerId) {
      console.log("=== DEBUG: Fetching customer with ID:", customerId);
      const customer = await getCustomer(parseInt(customerId));
      console.log("=== DEBUG: Customer data:", customer);

      if (!customer) {
        return (
          <>
            <h2 className="text-2xl mb-2">
              Customer ID #{customerId} not found
              <BackButton title="Go Back" variant="default" className="ml-4" />
            </h2>
          </>
        );
      }
      console.log("=== DEBUG: Rendering edit form for customer:", customer);
      // put customer form component here
      // return (
      //   <div>
      //     <h2>
      //       Edit Customer: {customer.firstName} {customer.lastName}
      //     </h2>
      //     <pre>{JSON.stringify(customer, null, 2)}</pre>
      //   </div>
      // );
      return <CustomerForm customer={customer} />;
    } else {
      console.log("=== DEBUG: No customerId, rendering new customer form");
      // put new customer form component here
      // return (
      //   <div>
      //     <h2>New Customer Form</h2>
      //   </div>
      // );
      return <CustomerForm />;
    }
  } catch (e) {
    console.error("=== DEBUG: Error caught:", e);
    if (e instanceof Error) {
      Sentry.captureException(e);
      throw e;
    }
  }
}

import { getCustomer } from "@/lib/queries/getCustomer";
import { getTicket } from "@/lib/queries/getTickets";
import { BackButton } from "@/components/BackButton";
import * as Sentry from "@sentry/nextjs";
import TicketForm from "@/app/(rs)/tickets/form/TicketForm";
// import { Ticket } from "lucide-react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Users, init as kindeInit } from "@kinde/management-api-js"
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}): Promise<Metadata> {
  const { customerId, ticketId } = await searchParams;

  if (!customerId && !ticketId) {
    return {
      title: 'Missing Ticket ID or Customer ID'
    }
  }
  if (customerId) {
    return {
      title: `New Ticket for Customer #${customerId}`
    }
  }
  if (ticketId) {
    return {
      title: 'Edit Ticket #${ticketId}'
    }
  }

  return {
    title: 'Ticket Form'
  }
}

export default async function TicketFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  try {
    const { customerId, ticketId } = await searchParams;

    if (!customerId && !ticketId) {
      return (
        <>
          <h2 className="text-2xl mb-2">
            Ticket ID or Customer ID required to load ticket form
          </h2>
          <BackButton title="Go Back" variant="default" />
        </>
      );
    }

    const { getPermission, getUser, getPermissions } = getKindeServerSession()
    const [managerPermission, user] = await Promise.all([
      getPermission("Manager"),
      getUser(),
      getPermissions(),
    ])
    const isManager = managerPermission?.isGranted

    // New ticket form
    if (customerId) {
      const customer = await getCustomer(parseInt(customerId));

      if (!customer) {
        return (
          <>
            <h2 className="text-2xl mb-2">
              Customer ID #{customerId} not found
            </h2>
            <BackButton title="Go Back" variant="default" />
          </>
        );
      }

      if (!customer.active) {
        return (
          <>
            <h2 className="text-2xl mb-2">
              Customer ID #{customerId} is not active.
            </h2>
            <BackButton title="Go Back" variant="default" />
          </>
        );
      }

      // return ticket form
      if (isManager) {
        kindeInit() // Initialize the Kinde Management API client
        const { users } = await Users.getUsers()

        const techs = users ? users.map(user => ({ id: user.email!, description: user.email! })) : []

        return <TicketForm customer={customer} techs={techs} />
      } else {
        return <TicketForm customer={customer} />
      }
    }

    // Edit ticket form
    if (ticketId) {
      const ticket = await getTicket(parseInt(ticketId));

      if (!ticket) {
        return (
          <>
            <h2 className="text-2xl mb-2">Ticket ID #{ticketId} not found</h2>
            <BackButton title="Go Back" variant="default" />
          </>
        );
      }

      const customer = await getCustomer(ticket.customerId);

      // return ticket form
      if (isManager) {
        kindeInit()  // Initialize the Kinde Management API client
        const { users } = await Users.getUsers()

        const techs = users ? users.map(user => ({
          id: user.email!,
          description: user.email!
        })) : []

        return <TicketForm customer={customer} ticket={ticket} techs={techs} />
      } else {
        const isEditable = user?.email?.toLowerCase() === ticket.tech.toLowerCase()
        console.log('ue: ', user?.email)
        console.log('tech', ticket.tech)
        return <TicketForm customer={customer} ticket={ticket} isEditable={isEditable} />
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      Sentry.captureException(e);
      throw e;
    }
  }
}
